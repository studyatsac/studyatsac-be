const { Worker } = require('bullmq');
const LogUtils = require('../../utils/logger');
const UserInterviewRepository = require('../../repositories/mysql/user_interview');
const UserInterviewSectionRepository = require('../../repositories/mysql/user_interview_item');
const UserInterviewConstants = require('../../constants/user_interview');
const InterviewReviewConstants = require('../../constants/interview_review');
const Models = require('../../models/mysql');
const Queues = require('../../queues/bullmq');

async function processInterviewReviewEntryJob(job) {
    if (job.name !== InterviewReviewConstants.JOB_NAME.ENTRY) return;

    const jobData = job.data;
    const userInterviewId = jobData.userInterviewId;
    if (!userInterviewId) return;

    const userInterview = await UserInterviewRepository.findOne(
        { id: userInterviewId },
        { include: { model: Models.UserInterviewSection, as: 'interviewSections' } }
    );

    const pendingUserInterviewSectionIds = userInterview.interviewSections.filter(
        (item) => item.reviewStatus === UserInterviewConstants.STATUS.QUEUED
    ).map((item) => item.id);
    if (pendingUserInterviewSectionIds.length) {
        await UserInterviewSectionRepository.update(
            { reviewStatus: UserInterviewConstants.STATUS.PENDING },
            { id: pendingUserInterviewSectionIds }
        );

        pendingUserInterviewSectionIds.forEach((interviewSectionId) => {
            Queues.InterviewReview.add(
                InterviewReviewConstants.JOB_NAME.ITEM,
                {
                    userInterviewSectionId: interviewSectionId,
                    pendingUserInterviewSectionIds,
                    userInterviewId: userInterview.id
                }
            );
        });

        await UserInterviewRepository.update(
            { itemReviewStatus: UserInterviewConstants.STATUS.PENDING },
            { id: userInterview.id }
        );
    }

    if (userInterview.overallReviewStatus !== UserInterviewConstants.STATUS.QUEUED) return;

    await UserInterviewRepository.update(
        { overallReviewStatus: UserInterviewConstants.STATUS.PENDING },
        { id: userInterview.id }
    );

    Queues.InterviewReview.add(InterviewReviewConstants.JOB_NAME.OVERALL, { userInterviewId: userInterview.id });
}

module.exports = (redis) => {
    const queue = Queues.InterviewReviewEntry;
    const queueName = queue.name;

    const worker = new Worker(
        queueName,
        processInterviewReviewEntryJob,
        { connection: redis, autorun: true }
    );
    worker.on('error', (err) => {
        LogUtils.logError(`Worker ${queueName} Error: ${err.message}`);
    });

    queue.defaultWorker = worker;

    return worker;
};
