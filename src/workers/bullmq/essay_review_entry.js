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

    const pendingUserEssayItemIds = userEssay.essayItems.filter(
        (item) => item.reviewStatus === UserEssayConstants.STATUS.QUEUED
    ).map((item) => item.id);
    if (pendingUserEssayItemIds.length) {
        await UserEssayItemRepository.update(
            { reviewStatus: UserEssayConstants.STATUS.PENDING },
            { id: pendingUserEssayItemIds }
        );

        pendingUserEssayItemIds.forEach((essayItemId) => {
            Queues.EssayReview.add(
                EssayReviewConstants.JOB_NAME.ITEM,
                {
                    userEssayItemId: essayItemId,
                    pendingUserEssayItemIds,
                    userEssayId: userEssay.id
                }
            );
        });

        await UserEssayRepository.update(
            { itemReviewStatus: UserEssayConstants.STATUS.PENDING },
            { id: userEssay.id }
        );
    }

    if (userEssay.overallReviewStatus !== UserEssayConstants.STATUS.QUEUED) return;

    await UserEssayRepository.update(
        { overallReviewStatus: UserEssayConstants.STATUS.PENDING },
        { id: userEssay.id }
    );

    Queues.EssayReview.add(EssayReviewConstants.JOB_NAME.OVERALL, { userEssayId: userEssay.id });
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
