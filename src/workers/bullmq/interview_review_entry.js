const { Worker } = require('bullmq');
const LogUtils = require('../../utils/logger');
const UserInterviewRepository = require('../../repositories/mysql/user_interview');
const UserInterviewSectionRepository = require('../../repositories/mysql/user_interview_section');
const UserInterviewSectionAnswerRepository = require('../../repositories/mysql/user_interview_section_answer');
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
        {
            include: {
                model: Models.UserInterviewSection,
                as: 'interviewSections',
                include: {
                    model: Models.UserInterviewSectionAnswer,
                    as: 'interviewSectionAnswers'
                }
            }
        }
    );

    let sectionJobs;
    let overallJob;
    try {
        await Models.sequelize.transaction(async (trx) => {
            let addSectionJobs;
            let userInterviewPayload = {};
            if (Array.isArray(userInterview.interviewSections) && userInterview.interviewSections.length) {
                const pendingPromises = userInterview.interviewSections
                    .filter((item) => item.reviewStatus === UserInterviewConstants.REVIEW_STATUS.QUEUED)
                    .map(async (interviewSection) => {
                        const pendingUserInterviewSectionAnswerIds = interviewSection.interviewSectionAnswers?.filter(
                            (item) => item.reviewStatus === UserInterviewConstants.REVIEW_STATUS.QUEUED
                        ).map((item) => item.id);
                        let userInterviewSectionPayload = {};
                        if (pendingUserInterviewSectionAnswerIds.length) {
                            await UserInterviewSectionAnswerRepository.update(
                                { reviewStatus: UserInterviewConstants.REVIEW_STATUS.PENDING },
                                { id: pendingUserInterviewSectionAnswerIds }
                            );

                            userInterviewSectionPayload = {
                                ...userInterviewSectionPayload,
                                answerReviewStatus: UserInterviewConstants.REVIEW_STATUS.PENDING
                            };
                        }

                        if (interviewSection.reviewStatus !== UserInterviewConstants.REVIEW_STATUS.QUEUED) {
                            userInterviewSectionPayload = {
                                ...userInterviewSectionPayload,
                                reviewStatus: UserInterviewConstants.REVIEW_STATUS.PENDING
                            };
                        }

                        await UserInterviewSectionRepository.update(
                            userInterviewSectionPayload,
                            { id: interviewSection.id }
                        );

                        return interviewSection.id;
                    });

                const pendingUserInterviewSectionIds = await Promise.all(pendingPromises);

                userInterviewPayload = {
                    ...userInterviewPayload,
                    sectionReviewStatus: UserInterviewConstants.REVIEW_STATUS.PENDING
                };

                addSectionJobs = async () => {
                    const jobPendingPromises = pendingUserInterviewSectionIds.map(async (interviewSectionId) => Queues.InterviewReview.add(
                        InterviewReviewConstants.JOB_NAME.SECTION,
                        {
                            userInterviewSectionId: interviewSectionId,
                            pendingUserInterviewSectionIds,
                            userInterviewId: userInterview.id
                        },
                        { delay: InterviewReviewConstants.JOB_DELAY }
                    ));

                    sectionJobs = await Promise.all(jobPendingPromises);
                };
            }

            if (userInterview.overallReviewStatus === UserInterviewConstants.STATUS.QUEUED) {
                userInterviewPayload = {
                    ...userInterviewPayload,
                    overallReviewStatus: UserInterviewConstants.STATUS.PENDING
                };
            }

            await UserInterviewRepository.update(userInterviewPayload, { id: userInterview.id }, trx);

            if (addSectionJobs) await addSectionJobs();

            if (userInterview.overallReviewStatus !== UserInterviewConstants.STATUS.QUEUED) return;

            overallJob = await Queues.InterviewReview.add(
                InterviewReviewConstants.JOB_NAME.OVERALL,
                { userInterviewId: userInterview.id },
                { delay: InterviewReviewConstants.JOB_DELAY }
            );
        });

        if (overallJob && (await overallJob.isDelayed())) await overallJob.changeDelay(0);
        if (sectionJobs) {
            const pendingPromises = sectionJobs?.map(async (item) => {
                if (item && (await item.isDelayed())) await item.changeDelay(0);
            });

            if (pendingPromises) await Promise.all(pendingPromises);
        }
    } catch (err) {
        if (overallJob) await overallJob.remove();
        if (sectionJobs) {
            const pendingPromises = sectionJobs?.map(async (item) => {
                if (item) await item.remove();
            });

            if (pendingPromises) await Promise.all(pendingPromises);
        }

        throw err;
    }
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
