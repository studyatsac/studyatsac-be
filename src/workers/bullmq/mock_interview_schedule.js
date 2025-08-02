const { Worker } = require('bullmq');
const LogUtils = require('../../utils/logger');
const UserInterviewRepository = require('../../repositories/mysql/user_interview');
const UserInterviewSectionRepository = require('../../repositories/mysql/user_interview_section');
const UserInterviewConstants = require('../../constants/user_interview');
const MockInterviewConstants = require('../../constants/mock_interview');
const Queues = require('../../queues/bullmq');
const MockInterviewCacheUtils = require('../../utils/mock_interview_cache');
const Models = require('../../models/mysql');

async function processMockInterviewScheduleTimerJob(job) {
    const jobData = job.data;
    const userId = jobData.userId;
    const userInterviewUuid = jobData.userInterviewUuid;
    if (!userInterviewUuid) return;

    try {
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
        if (
            !userInterview
            || userInterview.status !== UserInterviewConstants.STATUS.IN_PROGRESS
        ) {
            const timerJobId = await MockInterviewCacheUtils.getMockInterviewScheduleTimerJobId(
                userId,
                userInterviewUuid
            );
            if (timerJobId) {
                await Queues.MockInterviewSchedule.removeJobScheduler(timerJobId);
                await MockInterviewCacheUtils.deleteMockInterviewScheduleTimerJobId(userId, userInterviewUuid);
            }

            return;
        }

        const targetInterviewSection = userInterview.interviewSections?.[0];
        if (targetInterviewSection) {
            await UserInterviewSectionRepository.update(
                { duration: targetInterviewSection.duration + MockInterviewConstants.TIMER_INTERVAL_IN_SECONDS },
                { id: targetInterviewSection.id }
            );
        }

        const stopJobTime = await MockInterviewCacheUtils.getMockInterviewControlStopJobTime(
            userInterview.userId,
            userInterview.uuid
        );
        if (stopJobTime >= Date.now() || !targetInterviewSection) {
            const stopJob = await Queues.MockInterviewControl.add(
                MockInterviewConstants.JOB_NAME.STOP,
                { userInterviewUuid: userInterview.uuid, userId: userInterview.userId }
            );
            if (stopJob) return;
        }

        const pauseJobTime = await MockInterviewCacheUtils.getMockInterviewControlPauseJobTime(
            userInterview.userId,
            userInterview.uuid
        );
        if (pauseJobTime >= Date.now()) {
            await Queues.MockInterviewControl.add(
                MockInterviewConstants.JOB_NAME.PAUSE,
                { userInterviewUuid: userInterview.uuid, userId: userInterview.userId }
            );
        }
    } catch (error) {
        LogUtils.logError({ functionName: 'processMockInterviewScheduleTimerJob', message: error.message });

        throw error;
    }
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
