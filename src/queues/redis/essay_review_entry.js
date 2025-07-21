const { Queue, Worker } = require('bullmq');
const LogUtils = require('../../utils/logger');
const UserEssayRepository = require('../../repositories/mysql/user_essay');
const UserEssayItemRepository = require('../../repositories/mysql/user_essay_item');
const UserEssayConstants = require('../../constants/user_essay');
const EssayReviewConstants = require('../../constants/essay_review');
const Models = require('../../models/mysql');

async function processEssayReviewEntryJob(job) {
    if (job.name !== EssayReviewConstants.JOB_NAME.ENTRY) return;

    const jobData = JSON.parse(job.data);
    const userEssayId = jobData.userEssayId;
    if (!userEssayId) return;

    const userEssay = await UserEssayRepository.findOne(
        { id: userEssayId },
        { include: { model: Models.UserEssayItem, as: 'essayItems' } }
    );

    const Queues = require('.');

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
                JSON.stringify({
                    userEssayItemId: essayItemId,
                    pendingUserEssayItemIds,
                    userEssayId: userEssay.id
                })
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

    Queues.EssayReview.add(EssayReviewConstants.JOB_NAME.OVERALL, JSON.stringify({ userEssayId: userEssay.id }));
}

module.exports = (redis, defaultJobOptions) => {
    const queueName = 'EssayReviewEntry';
    const finalQueueName = `${process.env.QUEUE_PREFIX}-${queueName}`;

    const queue = new Queue(finalQueueName, { connection: redis.queue, defaultJobOptions });
    const defaultWorker = new Worker(
        finalQueueName,
        processEssayReviewEntryJob,
        { connection: redis.worker, autorun: true }
    );

    queue.defaultWorker = defaultWorker;

    queue.on('error', (err) => {
        LogUtils.loggingError(`Queue ${queueName} Error: ${err.message}`);
    });
    defaultWorker.on('error', (err) => {
        LogUtils.loggingError(`Worker ${queueName} Error: ${err.message}`);
    });

    return queue;
};
