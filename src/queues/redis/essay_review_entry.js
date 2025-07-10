const { Queue, Worker } = require('bullmq');
const LogUtils = require('../../utils/logger');
const UserEssayRepository = require('../../repositories/mysql/user_essay');
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
    const isSingleEssay = userEssay?.essayItems?.length === 1;
    if (
        !userEssay
        || userEssay.itemReviewStatus !== UserEssayConstants.STATUS.PENDING
        || (!isSingleEssay && userEssay.overallReviewStatus !== UserEssayConstants.STATUS.PENDING)
    ) {
        return;
    }

    const Queues = require('.');

    const pendingUserEssayItemIds = userEssay.essayItems.filter(
        (item) => item.reviewStatus === UserEssayConstants.STATUS.PENDING
    ).map((item) => item.id);
    if (pendingUserEssayItemIds.length) {
        await UserEssayRepository.update(
            { itemReviewStatus: UserEssayConstants.STATUS.IN_PROGRESS },
            { id: userEssay.id }
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
    }

    if (isSingleEssay) return;

    Queues.EssayReview.add(EssayReviewConstants.JOB_NAME.OVERALL, JSON.stringify({ userEssayId: userEssay.id }));
}

module.exports = (redis, defaultJobOptions) => {
    const queueName = 'EssayReviewEntry';

    const queue = new Queue(queueName, { connection: redis.queue, defaultJobOptions });
    const defaultWorker = new Worker(
        queueName,
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
