const { Worker } = require('bullmq');
const LogUtils = require('../../utils/logger');
const UserEssayRepository = require('../../repositories/mysql/user_essay');
const UserEssayItemRepository = require('../../repositories/mysql/user_essay_item');
const UserEssayConstants = require('../../constants/user_essay');
const EssayReviewConstants = require('../../constants/essay_review');
const Models = require('../../models/mysql');
const Queues = require('../../queues/bullmq');

async function processEssayReviewEntryJob(job) {
    if (job.name !== EssayReviewConstants.JOB_NAME.ENTRY) return;

    const jobData = job.data;
    const userEssayId = jobData.userEssayId;
    if (!userEssayId) return;

    const userEssay = await UserEssayRepository.findOne(
        { id: userEssayId },
        { include: { model: Models.UserEssayItem, as: 'essayItems' } }
    );

    let itemJobs;
    let overallJob;
    try {
        await Models.sequelize.transaction(async (trx) => {
            let addItemJobs;
            const pendingUserEssayItemIds = userEssay.essayItems.filter(
                (item) => item.reviewStatus === UserEssayConstants.STATUS.QUEUED
            ).map((item) => item.id);
            let userInterviewPayload = {};
            if (pendingUserEssayItemIds.length) {
                await UserEssayItemRepository.update(
                    { reviewStatus: UserEssayConstants.STATUS.PENDING },
                    { id: pendingUserEssayItemIds },
                    trx
                );

                userInterviewPayload = {
                    ...userInterviewPayload,
                    itemReviewStatus: UserEssayConstants.STATUS.PENDING
                };

                addItemJobs = async () => {
                    const pendingPromises = pendingUserEssayItemIds.map(async (essayItemId) => Queues.EssayReview.add(
                        EssayReviewConstants.JOB_NAME.ITEM,
                        {
                            userEssayItemId: essayItemId,
                            pendingUserEssayItemIds,
                            userEssayId: userEssay.id
                        },
                        { delay: EssayReviewConstants.JOB_DELAY }
                    ));

                    itemJobs = await Promise.all(pendingPromises);
                };
            }

            if (userEssay.overallReviewStatus === UserEssayConstants.STATUS.QUEUED) {
                userInterviewPayload = {
                    ...userInterviewPayload,
                    overallReviewStatus: UserEssayConstants.STATUS.PENDING
                };
            }

            await UserEssayRepository.update(userInterviewPayload, { id: userEssay.id }, trx);

            if (addItemJobs) await addItemJobs();

            if (userEssay.overallReviewStatus !== UserEssayConstants.STATUS.QUEUED) return;

            overallJob = await Queues.EssayReview.add(
                EssayReviewConstants.JOB_NAME.OVERALL,
                { userEssayId: userEssay.id },
                { delay: EssayReviewConstants.JOB_DELAY }
            );
        });

        if (overallJob && (await overallJob.isDelayed())) await overallJob.changeDelay(0);
        if (itemJobs) {
            const pendingPromises = itemJobs?.map(async (item) => {
                if (item && (await item.isDelayed())) await item.changeDelay(0);
            });

            if (pendingPromises) await Promise.all(pendingPromises);
        }
    } catch (err) {
        if (overallJob) await overallJob.remove();
        if (itemJobs) {
            const pendingPromises = itemJobs?.map(async (item) => {
                if (item) await item.remove();
            });

            if (pendingPromises) await Promise.all(pendingPromises);
        }

        LogUtils.logError({ functionName: 'processEssayReviewEntryJob', message: err.message });

        throw err;
    }
}

module.exports = (redis) => {
    const queue = Queues.EssayReviewEntry;
    const queueName = queue.name;

    const worker = new Worker(
        queueName,
        processEssayReviewEntryJob,
        { connection: redis, autorun: true }
    );
    worker.on('error', (err) => {
        LogUtils.logError(`Worker ${queueName} Error: ${err.message}`);
    });

    queue.defaultWorker = worker;

    return worker;
};
