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

class MockInterviewScheduleError extends Error {}

async function processMockInterviewScheduleTimerJob(job) {
    const jobData = job.data;
    const userId = jobData.userId;
    const userInterviewUuid = jobData.userInterviewUuid;
    if (!userInterviewUuid) return;

    const userInterview = await UserInterviewRepository.findOne(
        { uuid: userInterviewUuid, userId },
        { attributes: ['id', 'uuid', 'status', 'userId', 'duration'] }
    );
    if (!userInterview || userInterview.status !== UserInterviewConstants.STATUS.IN_PROGRESS) return;

    await UserInterviewRepository.update(
        { duration: userInterview.duration + MockInterviewConstants.TIMER_INTERVAL_IN_SECONDS },
        { id: userInterview.id }
    );
}

async function processMockInterviewScheduleJob(job, token) {
    switch (job.name) {
    case MockInterviewConstants.JOB_NAME.TIMER:
        await processMockInterviewScheduleTimerJob(job, token);
        break;
    default:
        break;
    }
}

module.exports = (redis) => {
    const queue = Queues.MockInterviewSchedule;
    const queueName = queue.name;

    const worker = new Worker(
        queueName,
        processMockInterviewScheduleJob,
        { connection: redis }
    );
    worker.on('error', (err) => {
        LogUtils.logError(`Worker ${queueName} Error: ${err.message}`);
    });

    queue.defaultWorker = worker;

    return worker;
};
