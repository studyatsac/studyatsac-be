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

class MockInterviewControlError extends Error {}

async function processMockInterviewControlPauseJob(job, token) {
    const jobData = job.data;
    const userId = jobData.userId;
    const userInterviewUuid = jobData.userInterviewUuid;
    if (!userInterviewUuid) return;

    const userInterview = await UserInterviewRepository.findOne(
        { uuid: userInterviewUuid, userId },
        { attributes: ['id', 'uuid', 'status', 'userId'] }
    );
    if (!userInterview || userInterview.status !== UserInterviewConstants.STATUS.IN_PROGRESS) return;

    const sessionId = await MockInterviewCacheUtils.getMockInterviewSessionId(userInterview.userId, userInterview.uuid);

    const jobId = await MockInterviewCacheUtils.getMockInterviewPauseJobId(userInterview.userId, userInterview.uuid);
    if (jobId !== job.id) return;

    let isPauseUpdated = false;
    let stopJob;
    let isStopUpdated = false;
    try {
        await Models.sequelize.transaction(async (trx) => {
            let result = await UserInterviewRepository.update(
                { status: UserInterviewConstants.STATUS.PAUSED, pausedAt: Moment().format() },
                { id: userInterview.id },
                trx
            );
            if (!result) throw new MockInterviewControlError();

            result = await UserInterviewSectionRepository.update(
                {
                    status: UserInterviewConstants.SECTION_STATUS.PAUSED,
                    pausedAt: Moment().format(),
                    duration: Models.Sequelize.literal('duration + TIMESTAMPDIFF(SECOND, resumed_at, CURRENT_TIMESTAMP)')
                },
                { userInterviewId: userInterview.id, status: UserInterviewConstants.SECTION_STATUS.IN_PROGRESS },
                trx
            );
            if (!result) throw new MockInterviewControlError();

            await MockInterviewCacheUtils.deleteMockInterviewSessionId(userInterview.userId, userInterview.uuid);

            await MockInterviewCacheUtils.deleteMockInterviewPauseJobId(userInterview.userId, userInterview.uuid);
            isPauseUpdated = true;

            const stopJobId = await MockInterviewCacheUtils.getMockInterviewStopJobId(userInterview.userId, userInterview.uuid);
            if (stopJobId) {
                stopJob = await Queues.MockInterviewControl.getJob(stopJobId);
                if (stopJob && !(await stopJob.isCompleted())) {
                    await stopJob.updateData({});
                    isStopUpdated = true;
                }
                await MockInterviewCacheUtils.deleteMockInterviewStopJobId(userInterview.userId, userInterview.uuid);
            }

            if (
                !(await AiServiceSocket.emitAiServiceEventWithAck(
                    MockInterviewConstants.AI_SERVICE_EVENT_NAME.END_SPEECH,
                    sessionId
                ))
            ) throw new MockInterviewControlError();
        });
    } catch (err) {
        await MockInterviewCacheUtils.setMockInterviewSessionId(userInterview.userId, userInterview.uuid, sessionId);

        if (isPauseUpdated) {
            await MockInterviewCacheUtils.setMockInterviewPauseJobId(userInterview.userId, userInterview.uuid, job.id);
        }
        if (stopJob) {
            if (isStopUpdated) await stopJob.updateData({ userInterviewUuid: userInterview.uuid, userId: userInterview.userId });
            await MockInterviewCacheUtils.setMockInterviewStopJobId(userInterview.userId, userInterview.uuid, stopJob.id);
        }

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
    if (!userInterviewUuid) return;

    const userInterview = await UserInterviewRepository.findOne(
        { uuid: userInterviewUuid, userId },
        { attributes: ['id', 'uuid', 'status', 'userId'] }
    );
    if (!userInterview) return;

    const sessionId = await MockInterviewCacheUtils.getMockInterviewSessionId(userInterview.userId, userInterview.uuid);

    const jobId = await MockInterviewCacheUtils.getMockInterviewStopJobId(userInterview.userId, userInterview.uuid);
    if (jobId !== job.id) return;

    let isStopUpdated = false;
    try {
        await Models.sequelize.transaction(async (trx) => {
            const updatedData = await UserInterviewRepository.update(
                { status: UserInterviewConstants.SECTION_STATUS.COMPLETED, completedAt: Moment().format() },
                { id: userInterview.id },
                trx
            );
            if (!updatedData) throw new MockInterviewControlError();

            await MockInterviewCacheUtils.deleteMockInterviewSessionId(userInterview.userId, userInterview.uuid);

            const pauseJobId = await MockInterviewCacheUtils.getMockInterviewPauseJobId(userInterview.userId, userInterview.uuid);
            if (pauseJobId) {
                const pauseJob = await Queues.MockInterviewControl.getJob(pauseJobId);

                // eslint-disable-next-line max-depth
                if (pauseJob && !(await pauseJob.isCompleted())) {
                    await pauseJob.updateData({});
                }

                await MockInterviewCacheUtils.deleteMockInterviewPauseJobId(userInterview.userId, userInterview.uuid);
            }

            await MockInterviewCacheUtils.deleteMockInterviewStopJobId(userInterview.userId, userInterview.uuid);
            isStopUpdated = true;

            if (
                !(await AiServiceSocket.emitAiServiceEventWithAck(
                    MockInterviewConstants.AI_SERVICE_EVENT_NAME.END_SPEECH,
                    sessionId
                ))
            ) throw new MockInterviewControlError();
        });
    } catch (err) {
        await MockInterviewCacheUtils.setMockInterviewSessionId(userInterview.userId, userInterview.uuid, sessionId);

        if (isStopUpdated) {
            await MockInterviewCacheUtils.setMockInterviewStopJobId(userInterview.userId, userInterview.uuid, job.id);
        }

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
