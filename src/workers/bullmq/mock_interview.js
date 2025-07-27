const { Worker } = require('bullmq');
const Moment = require('moment');
const LogUtils = require('../../utils/logger');
const UserInterviewRepository = require('../../repositories/mysql/user_interview');
const UserInterviewConstants = require('../../constants/user_interview');
const MockInterviewConstants = require('../../constants/mock_interview');
const Models = require('../../models/mysql');
const Queues = require('../../queues/bullmq');
const MockInterviewUtils = require('../../utils/mock_interview');
const AiServiceSocket = require('../../clients/socket/ai_service');

async function processMockInterviewPauseJob(job) {
    const jobData = job.data;
    const userId = jobData.userId;
    const userInterviewUuid = jobData.userInterviewUuid;
    if (!userInterviewUuid) return;

    const userInterview = await UserInterviewRepository.findOne(
        { uuid: userInterviewUuid, userId },
        { attributes: ['id', 'uuid', 'status', 'userId'] }
    );
    if (!userInterview || userInterview.status !== UserInterviewConstants.STATUS.IN_PROGRESS) return;

    const sessionId = await MockInterviewUtils.getMockInterviewSessionId(userInterview.userId, userInterview.uuid);

    try {
        await Models.sequelize.transaction(async (trx) => {
            const result = await UserInterviewRepository.update(
                { status: UserInterviewConstants.STATUS.PAUSED, pausedAt: Moment().format() },
                { id: userInterview.id },
                trx
            );

            await MockInterviewUtils.deleteMockInterviewSessionId(userInterview.userId, userInterview.uuid);

            await MockInterviewUtils.deleteMockInterviewPauseJobId(userInterview.userId, userInterview.uuid);

            if (
                !(await AiServiceSocket.emitAiServiceEventWithAck(
                    MockInterviewConstants.AI_SERVICE_EVENT_NAME.END_SPEECH,
                    sessionId
                ))
            ) throw new Error();

            return result;
        });
    } catch (err) {
        await MockInterviewUtils.setMockInterviewSessionId(userInterview.userId, userInterview.uuid, sessionId);

        LogUtils.logError({ functionName: 'processMockInterviewPauseJob', message: err.message });

        throw err;
    }
}

async function processMockInterviewRespondJob(job) {
    const jobData = job.data;
    const userId = jobData.userId;
    const userInterviewUuid = jobData.userInterviewUuid;
    if (!userInterviewUuid) return;

    const userInterview = await UserInterviewRepository.findOne(
        { uuid: userInterviewUuid, userId },
        { attributes: ['id', 'uuid', 'status', 'userId'] }
    );
    if (!userInterview || userInterview.status !== UserInterviewConstants.STATUS.IN_PROGRESS) return;

    const sessionId = await MockInterviewUtils.getMockInterviewSessionId(userInterview.userId, userInterview.uuid);

    const texts = await MockInterviewUtils.getMockInterviewSpeechTexts(userInterview.userId, userInterview.uuid);
    if (!texts || !Array.isArray(texts) || texts.length === 0) return;

    const speechTextsOwner = await MockInterviewUtils.getMockInterviewRespondJobId(userId, userInterviewUuid);
    if (speechTextsOwner !== job.id) return;

    const text = texts.map((item) => item?.content ?? '').filter(Boolean).join(' ');
    AiServiceSocket.emitAiServiceEvent(
        'client_process',
        sessionId,
        'Identitas',
        'Siapa kamu?',
        text,
        ['Keluarga mu ada berapa?', 'Kamu lahir tanggal berapa?']
    );

    await MockInterviewUtils.deleteMockInterviewSpeechTexts(userId, userInterviewUuid);
    await MockInterviewUtils.deleteMockInterviewRespondJobId(userId, userInterviewUuid);
}

async function processMockInterviewJob(job) {
    switch (job.name) {
    case MockInterviewConstants.JOB_NAME.PAUSE:
        processMockInterviewPauseJob(job);
        break;
    case MockInterviewConstants.JOB_NAME.RESPOND:
        processMockInterviewRespondJob(job);
        break;
    default:
        break;
    }
}

module.exports = (redis) => {
    const queue = Queues.MockInterview;
    const queueName = queue.name;

    const worker = new Worker(
        queueName,
        processMockInterviewJob,
        { connection: redis, autorun: true }
    );
    worker.on('error', (err) => {
        LogUtils.logError(`Worker ${queueName} Error: ${err.message}`);
    });

    queue.defaultWorker = worker;

    return worker;
};
