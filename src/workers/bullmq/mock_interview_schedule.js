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
    if (!userInterviewUuid || !userId) return;

    const interviewSectionUuid = jobData.userInterviewSectionUuid;
    const shouldWaitForUpdate = (job?.timestamp ?? 0) <= MockInterviewConstants.JOB_DELAY
        && !!interviewSectionUuid;
    try {
        const userInterview = await UserInterviewRepository.findOne(
            { uuid: userInterviewUuid, userId },
            {
                include: {
                    required: false,
                    model: Models.UserInterviewSection,
                    as: 'interviewSections',
                    where: {
                        [Models.Op.or]: [
                            { status: UserInterviewConstants.SECTION_STATUS.IN_PROGRESS },
                            ...((interviewSectionUuid && shouldWaitForUpdate)
                                ? [{ uuid: interviewSectionUuid }]
                                : []
                            )
                        ]
                    }
                }
            }
        );

        if (
            !shouldWaitForUpdate
            && (
                !userInterview
                || (userInterview.status !== UserInterviewConstants.STATUS.IN_PROGRESS
                && userInterview.status !== UserInterviewConstants.STATUS.PAUSED)
            )
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

        let targetInterviewSection = userInterview.interviewSections?.find(
            (item) => item.status === UserInterviewConstants.SECTION_STATUS.IN_PROGRESS
        );
        if (!targetInterviewSection && shouldWaitForUpdate) {
            targetInterviewSection = userInterview.interviewSections?.[0];
        }
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

        const getStopJob = async () => {
            const stopJobId = await MockInterviewCacheUtils.getMockInterviewControlStopJobId(
                userInterview.userId,
                userInterview.uuid
            );
            let stopJob;
            if (stopJobId) {
                stopJob = await Queues.MockInterviewControl.getJob(stopJobId);
                if (stopJob) return stopJob;
            }
            return undefined;
        };
        const deleteStopJob = async (stopJob) => {
            let targetJob = stopJob ?? (await getStopJob());
            if (!targetJob) return targetJob;

            await targetJob.updateData({});
            await MockInterviewCacheUtils.deleteMockInterviewControlStopJobId(
                userInterview.userId,
                userInterview.uuid
            );
            targetJob = undefined;

            return targetJob;
        };

        if (isElapsed || !targetInterviewSection) {
            let stopJob = await getStopJob();
            if (stopJob) {
                // eslint-disable-next-line max-depth
                if (await stopJob.isDelayed()) {
                    // eslint-disable-next-line max-depth
                    if (isElapsed) await stopJob.changeDelay(0);
                } else {
                    stopJob = await deleteStopJob(stopJob);
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
        } else await deleteStopJob();

        const getPauseJob = async () => {
            const jobId = await MockInterviewCacheUtils.getMockInterviewControlPauseJobId(
                userInterview.userId,
                userInterview.uuid
            );
            if (!jobId) return undefined;

            return Queues.MockInterviewControl.getJob(jobId);
        };

        const pauseJobTime = await MockInterviewCacheUtils.getMockInterviewControlPauseJobTime(
            userInterview.userId,
            userInterview.uuid
        );
        if (pauseJobTime && pauseJobTime <= Date.now()) {
            let pauseJob = await getPauseJob();
            if (pauseJob) return;

            pauseJob = await Queues.MockInterviewControl.add(
                MockInterviewConstants.JOB_NAME.PAUSE,
                { userInterviewUuid: userInterview.uuid, userId: userInterview.userId }
            );
            await MockInterviewCacheUtils.setMockInterviewControlPauseJobId(
                userInterview.userId,
                userInterview.uuid,
                pauseJob.id
            );
        } else {
            const pauseJob = await getPauseJob();
            if (!pauseJob) return;

            await pauseJob.updateData({});
            await MockInterviewCacheUtils.deleteMockInterviewControlPauseJobId(
                userInterview.userId,
                userInterview.uuid
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
