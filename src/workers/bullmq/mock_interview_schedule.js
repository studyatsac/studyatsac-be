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
        const isElapsed = stopJobTime && stopJobTime <= Date.now();
        if (isElapsed || !targetInterviewSection) {
            const stopJobId = await MockInterviewCacheUtils.getMockInterviewControlStopJobId(
                userInterview.userId,
                userInterview.uuid
            );
            let stopJob;
            if (stopJobId) {
                stopJob = await Queues.MockInterviewControl.getJob(stopJobId);
                // eslint-disable-next-line max-depth
                if (stopJob) {
                    // eslint-disable-next-line max-depth
                    if (await stopJob.isDelayed()) {
                        // eslint-disable-next-line max-depth
                        if (isElapsed) await stopJob.changeDelay(0);
                    } else {
                        await stopJob.updateData({});
                        await MockInterviewCacheUtils.deleteMockInterviewControlStopJobId(
                            userInterview.userId,
                            userInterview.uuid
                        );
                        stopJob = undefined;
                    }
                }
            }

            if (!stopJob) {
                stopJob = await Queues.MockInterviewControl.add(
                    MockInterviewConstants.JOB_NAME.STOP,
                    { userInterviewUuid: userInterview.uuid, userId: userInterview.userId },
                    {
                        delay: isElapsed
                            ? 0
                            : MockInterviewConstants.STOP_DELAY_TIME_IN_MILLISECONDS
                    }
                );
                await MockInterviewCacheUtils.setMockInterviewControlStopJobId(
                    userInterview.userId,
                    userInterview.uuid,
                    stopJob.id
                );
            }

            if (stopJob) return;
        }

        const pauseJobTime = await MockInterviewCacheUtils.getMockInterviewControlPauseJobTime(
            userInterview.userId,
            userInterview.uuid
        );
        if (pauseJobTime && pauseJobTime <= Date.now()) {
            const pauseJobId = await MockInterviewCacheUtils.getMockInterviewControlPauseJobId(
                userInterview.userId,
                userInterview.uuid
            );
            let pauseJob;
            if (pauseJobId) {
                pauseJob = await Queues.MockInterviewControl.getJob(pauseJobId);
                // eslint-disable-next-line max-depth
                if (pauseJob) return;
            }

            pauseJob = await Queues.MockInterviewControl.add(
                MockInterviewConstants.JOB_NAME.PAUSE,
                { userInterviewUuid: userInterview.uuid, userId: userInterview.userId }
            );
            await MockInterviewCacheUtils.setMockInterviewControlPauseJobId(
                userInterview.userId,
                userInterview.uuid,
                pauseJob.id
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
