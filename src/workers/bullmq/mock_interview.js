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

    await Models.sequelize.transaction(async (trx) => {
        const result = await UserInterviewRepository.update(
            { status: UserInterviewConstants.STATUS.PAUSED, pausedAt: Moment().format() },
            { id: userInterview.id },
            trx
        );

        await MockInterviewUtils.deleteMockInterviewPauseJobCache(userInterview.userId, userInterview.uuid);

        if (!(await AiServiceSocket.emitEventWithAck('end_speech', userInterview.uuid))) throw new Error();

        return result;
    });
}

async function processMockInterviewRespondJob(job) {
    const jobData = job.data;
    const userId = jobData.userId;
    const userInterviewUuid = jobData.userInterviewUuid;
    if (!userInterviewUuid) return;

    await MockInterviewUtils.deleteMockInterviewRespondJobCache(userId, userInterviewUuid);

    const userInterview = await UserInterviewRepository.findOne(
        { uuid: userInterviewUuid, userId },
        { attributes: ['id', 'uuid', 'status', 'userId'] }
    );
    if (!userInterview || userInterview.status !== UserInterviewConstants.STATUS.IN_PROGRESS) return;

    const texts = await MockInterviewUtils.getMockInterviewSpeechTexts(userInterview.userId, userInterview.uuid);
    if (!texts || !Array.isArray(texts) || texts.length === 0) return;

    await MockInterviewUtils.deleteMockInterviewSpeechTexts(userId, userInterviewUuid);

    console.log(
        'Time to respond',
        userInterview.uuid,
        texts.map((text) => text?.content).join('')
    );
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
