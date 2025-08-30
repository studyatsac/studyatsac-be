const { Worker, DelayedError } = require('bullmq');
const Moment = require('moment');
const LogUtils = require('../../utils/logger');
const UserInterviewRepository = require('../../repositories/mysql/user_interview');
const UserInterviewSectionRepository = require('../../repositories/mysql/user_interview_section');
const UserInterviewConstants = require('../../constants/user_interview');
const MockInterviewConstants = require('../../constants/mock_interview');
const Models = require('../../models/mysql');
const Queues = require('../../queues/bullmq');
const MockInterviewCacheUtils = require('../../utils/mock_interview_cache');
const AiServiceSocket = require('../../clients/socket/ai_service');
const SocketServer = require('../../servers/socket/main');

class MockInterviewControlError extends Error {}

async function processMockInterviewControlPauseJob(job, token) {
    const jobData = job.data;
    const userId = jobData.userId;
    const userInterviewUuid = jobData.userInterviewUuid;
    if (!userInterviewUuid || !userId) return;

    const userInterview = await UserInterviewRepository.findOne(
        { uuid: userInterviewUuid, userId },
        { attributes: ['id', 'uuid', 'status', 'userId'] }
    );
    if (!userInterview || userInterview.status !== UserInterviewConstants.STATUS.IN_PROGRESS) return;

    const sessionId = await MockInterviewCacheUtils.getMockInterviewSessionId(
        userInterview.userId,
        userInterview.uuid
    );

    const jobTime = await MockInterviewCacheUtils.getMockInterviewControlPauseJobTime(
        userInterview.userId,
        userInterview.uuid
    );
    if (jobTime >= Date.now()) return;

    const jobId = await MockInterviewCacheUtils.getMockInterviewControlPauseJobId(
        userInterview.userId,
        userInterview.uuid
    );
    if (jobId !== job.id) return;

    let isPauseUpdated = false;
    let stopJobTime;
    try {
        await Models.sequelize.transaction(async (trx) => {
            let result = await UserInterviewRepository.update(
                { status: UserInterviewConstants.STATUS.PAUSED, pausedAt: Moment().format() },
                { id: userInterview.id },
                trx
            );
            if ((Array.isArray(result) && !result[0]) || !result) {
                throw new MockInterviewControlError();
            }

            result = await UserInterviewSectionRepository.update(
                {
                    status: UserInterviewConstants.SECTION_STATUS.PAUSED,
                    pausedAt: Moment().format()
                },
                {
                    userInterviewId: userInterview.id,
                    status: UserInterviewConstants.SECTION_STATUS.IN_PROGRESS
                },
                trx
            );
            if ((Array.isArray(result) && !result[0]) || !result) {
                throw new MockInterviewControlError();
            }

            await MockInterviewCacheUtils.deleteMockInterviewSessionId(
                userInterview.userId,
                userInterview.uuid
            );

            await MockInterviewCacheUtils.deleteMockInterviewControlPauseJobTime(
                userInterview.userId,
                userInterview.uuid
            );
            isPauseUpdated = true;

            stopJobTime = await MockInterviewCacheUtils.getMockInterviewControlStopJobTime(
                userInterview.userId,
                userInterview.uuid
            );
            if (stopJobTime) {
                await MockInterviewCacheUtils.deleteMockInterviewControlStopJobTime(
                    userInterview.userId,
                    userInterview.uuid
                );
            }

            if (
                AiServiceSocket.isAiServiceSocketConnected()
                && !(await AiServiceSocket.emitAiServiceEventWithAckBooleanTimeout(
                    MockInterviewConstants.AI_SERVICE_EVENT_NAME.END_CLIENT,
                    sessionId
                ))
            ) throw new MockInterviewControlError();
        });

        const clientSid = await MockInterviewCacheUtils.getMockInterviewSid(
            userInterview.userId,
            userInterview.uuid
        );
        if (!clientSid) return;

        SocketServer.emitEventToClient(clientSid, MockInterviewConstants.EVENT_NAME.CONTROL);
    } catch (err) {
        if (isPauseUpdated) {
            await MockInterviewCacheUtils.setMockInterviewControlPauseJobTime(
                userInterview.userId,
                userInterview.uuid,
                jobTime
            );
        }
        if (stopJobTime) {
            await MockInterviewCacheUtils.setMockInterviewControlStopJobTime(
                userInterview.userId,
                userInterview.uuid,
                stopJobTime
            );
        }
        await MockInterviewCacheUtils.setMockInterviewSessionId(
            userInterview.userId,
            userInterview.uuid,
            sessionId
        );

        if (err instanceof MockInterviewControlError) {
            await job.moveToDelayed(Date.now() + 1000, token);
            throw new DelayedError();
        }

        LogUtils.logError({ functionName: 'processMockInterviewControlPauseJob', message: err.message });

        throw err;
    }
}

async function processMockInterviewControlStopJob(job, token) {
    const jobData = job.data;
    const userId = jobData.userId;
    const userInterviewUuid = jobData.userInterviewUuid;
    if (!userInterviewUuid || !userId) return;

    const userInterview = await UserInterviewRepository.findOne(
        { uuid: userInterviewUuid, userId },
        {
            include: {
                required: false,
                model: Models.UserInterviewSection,
                as: 'interviewSections',
                where: { status: UserInterviewConstants.SECTION_STATUS.IN_PROGRESS }
            }
        }
    );
    if (!userInterview) return;

    const sessionId = await MockInterviewCacheUtils.getMockInterviewSessionId(
        userInterview.userId,
        userInterview.uuid
    );

    const jobTime = await MockInterviewCacheUtils.getMockInterviewControlStopJobTime(
        userInterview.userId,
        userInterview.uuid
    );
    if (!!userInterview.interviewSections?.length && jobTime >= Date.now()) return;

    const jobId = await MockInterviewCacheUtils.getMockInterviewControlStopJobId(
        userInterview.userId,
        userInterview.uuid
    );
    if (jobId !== job.id) return;

    let pauseJobTime;
    let isStopUpdated = false;
    try {
        await Models.sequelize.transaction(async (trx) => {
            const result = await UserInterviewRepository.update(
                { status: UserInterviewConstants.SECTION_STATUS.COMPLETED, completedAt: Moment().format() },
                { id: userInterview.id },
                trx
            );
            if ((Array.isArray(result) && !result[0]) || !result) {
                throw new MockInterviewControlError();
            }

            await MockInterviewCacheUtils.deleteMockInterviewSessionId(userInterview.userId, userInterview.uuid);

            pauseJobTime = await MockInterviewCacheUtils.getMockInterviewControlPauseJobTime(
                userInterview.userId,
                userInterview.uuid
            );
            if (pauseJobTime) {
                await MockInterviewCacheUtils.deleteMockInterviewControlPauseJobTime(
                    userInterview.userId,
                    userInterview.uuid
                );
            }

            await MockInterviewCacheUtils.deleteMockInterviewControlStopJobTime(
                userInterview.userId,
                userInterview.uuid
            );
            isStopUpdated = true;

            if (
                AiServiceSocket.isAiServiceSocketConnected()
                && !(await AiServiceSocket.emitAiServiceEventWithAckBooleanTimeout(
                    MockInterviewConstants.AI_SERVICE_EVENT_NAME.END_CLIENT,
                    sessionId
                ))
            ) throw new MockInterviewControlError();
        });

        const clientSid = await MockInterviewCacheUtils.getMockInterviewSid(
            userInterview.userId,
            userInterview.uuid
        );
        if (!clientSid) return;

        SocketServer.emitEventToClient(clientSid, MockInterviewConstants.EVENT_NAME.CONTROL);
    } catch (err) {
        if (pauseJobTime) {
            await MockInterviewCacheUtils.setMockInterviewControlPauseJobTime(
                userInterview.userId,
                userInterview.uuid,
                pauseJobTime
            );
        }
        if (isStopUpdated) {
            await MockInterviewCacheUtils.setMockInterviewControlStopJobTime(
                userInterview.userId,
                userInterview.uuid,
                jobTime
            );
        }
        await MockInterviewCacheUtils.setMockInterviewSessionId(userInterview.userId, userInterview.uuid, sessionId);

        if (err instanceof MockInterviewControlError) {
            await job.moveToDelayed(Date.now() + 1000, token);
            throw new DelayedError();
        }

        LogUtils.logError({ functionName: 'processMockInterviewControlStopJob', message: err.message });

        throw err;
    }
}

async function processMockInterviewControlJob(job, token) {
    switch (job.name) {
    case MockInterviewConstants.JOB_NAME.PAUSE:
        await processMockInterviewControlPauseJob(job, token);
        break;
    case MockInterviewConstants.JOB_NAME.STOP:
        await processMockInterviewControlStopJob(job, token);
        break;
    default:
        break;
    }
}

module.exports = (redis) => {
    const queue = Queues.MockInterviewControl;
    const queueName = queue.name;

    const worker = new Worker(
        queueName,
        processMockInterviewControlJob,
        { connection: redis, autorun: true }
    );
    worker.on('error', (err) => {
        LogUtils.logError(`Worker ${queueName} Error: ${err.message}`);
    });

    queue.defaultWorker = worker;

    return worker;
};
