const { Worker } = require('bullmq');
const LogUtils = require('../../utils/logger');
const UserInterviewRepository = require('../../repositories/mysql/user_interview');
const UserInterviewConstants = require('../../constants/user_interview');
const MockInterviewConstants = require('../../constants/mock_interview');
const Models = require('../../models/mysql');
const Queues = require('../../queues/bullmq');
const MockInterviewUtils = require('../../utils/mock_interview');
const AiServiceSocket = require('../../clients/socket/ai_service');

async function processMockInterviewJob(job) {
    if (job.name !== MockInterviewConstants.JOB_NAME.PAUSE) return;

    const jobData = job.data;
    const userInterviewId = jobData.userInterviewId;
    if (!userInterviewId) return;

    const userInterview = await UserInterviewRepository.findOne(
        { id: userInterviewId },
        { attributes: ['id', 'uuid', 'status', 'userId'] }
    );
    if (!userInterview || userInterview.status !== UserInterviewConstants.STATUS.IN_PROGRESS) return;

    await Models.sequelize.transaction(async (trx) => {
        const result = await UserInterviewRepository.update(
            { status: UserInterviewConstants.STATUS.PAUSED },
            { id: userInterview.id },
            trx
        );

        await MockInterviewUtils.deleteMockInterviewCache(userInterview.userId, userInterview.uuid);

        if (!(await AiServiceSocket.emitEventWithAck('end_speech', userInterview.uuid))) throw new Error();

        return result;
    });
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
