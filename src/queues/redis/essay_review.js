const { Queue, Worker } = require('bullmq');
const OpenAI = require('openai');
const LogUtils = require('../../utils/logger');
const PromptUtils = require('../../utils/prompt');
const UserEssayRepository = require('../../repositories/mysql/user_essay');
const UserEssayItemRepository = require('../../repositories/mysql/user_essay_item');
const UserEssayConstants = require('../../constants/user_essay');
const CommonConstants = require('../../constants/common');
const EssayReviewLogRepository = require('../../repositories/mysql/essay_review_log');
const Models = require('../../models/mysql');
const EssayReviewConstants = require('../../constants/essay_review');

const openAi = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function insertEssayReviewLog(payload, data, isSuccess = false) {
    try {
        let metadata = {};
        if (data && typeof data === 'object') {
            if (isSuccess) {
                metadata = {
                    id: data?.id,
                    object: data?.object,
                    created: data?.created,
                    model: data?.model,
                    usage: data?.usage,
                    service_tier: data?.service_tier,
                    system_fingerprint: data?.system_fingerprint
                };
            } else {
                metadata = {
                    error: data?.error,
                    requestID: data?.requestID,
                    code: data?.code,
                    param: data?.param,
                    type: data?.type
                };
            }
        }

        await EssayReviewLogRepository.create({ ...payload, metadata });
    } catch (err) {
        LogUtils.loggingError({ functionName: 'insertEssayReviewLog', message: err.message });
    }
}

async function callApiReview(userEssayId, content, topic = 'Overall Essay', criteria, language, backgroundDescription) {
    try {
        const response = await openAi.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: PromptUtils.getBasePrompt(backgroundDescription, topic, CommonConstants.LANGUAGE_LABELS[language] || 'English')
                },
                {
                    role: 'user',
                    content: PromptUtils.getReviewSystemPrompt(
                        criteria,
                        content
                    )
                }
            ],
            temperature: 0.3,
            max_tokens: 16384
        });

        await insertEssayReviewLog({ userEssayId }, response, true);

        return response.choices[0].message.content;
    } catch (err) {
        await insertEssayReviewLog({ userEssayId, notes: err.message }, err);

        throw err;
    }
}

async function processEssayReviewOverallJob(job) {
    const jobData = JSON.parse(job.data);
    const userEssayId = jobData.userEssayId;
    if (!userEssayId) return;

    const userEssay = await UserEssayRepository.findOne(
        { id: userEssayId },
        {
            include: {
                model: Models.UserEssayItem,
                as: 'essayItems',
                include: { model: Models.EssayItem, as: 'essayItem' }
            }
        }
    );
    if (
        !userEssay
        || userEssay.overallReviewStatus !== UserEssayConstants.STATUS.PENDING
    ) {
        return;
    }

    try {
        await UserEssayRepository.update(
            { overallReviewStatus: UserEssayConstants.STATUS.IN_PROGRESS },
            { id: userEssay.id }
        );

        const overallContent = userEssay.essayItems.reduce(
            (text, item) => `${text}\n=====
                ${item.essayItem.topic}\n
                ${item.answer}\n=====`, ''
        );

        const overallReview = await callApiReview(userEssayId, overallContent, 'Overall Essay', '', userEssay.language);

        await UserEssayRepository.update(
            { overallReviewStatus: UserEssayConstants.STATUS.COMPLETED, overallReview },
            { id: userEssay.id }
        );
    } catch (err) {
        LogUtils.loggingError({ functionName: 'processEssayReviewOverallJob', message: err.message });

        await UserEssayRepository.update(
            { overallReviewStatus: UserEssayConstants.STATUS.FAILED },
            { id: userEssay.id }
        );
    }
}

async function processEssayReviewItemJob(job) {
    const jobData = JSON.parse(job.data);
    const userEssayId = jobData.userEssayId;
    const userEssayItemId = jobData.userEssayItemId;
    if (!userEssayId || !userEssayItemId) return;

    const userEssay = await UserEssayRepository.findOne({ id: userEssayId });
    const userEssayItem = await UserEssayItemRepository.findOne(
        { id: userEssayItemId },
        { include: { model: Models.EssayItem, as: 'essayItem' } }
    );
    if (
        !userEssay
        || !userEssayItem
        || userEssayItem.reviewStatus !== UserEssayConstants.STATUS.PENDING
    ) {
        return;
    }

    if (userEssay.itemReviewStatus !== UserEssayConstants.STATUS.IN_PROGRESS) {
        await UserEssayRepository.update(
            { itemReviewStatus: UserEssayConstants.STATUS.IN_PROGRESS },
            { id: userEssay.id }
        );
    }

    await UserEssayItemRepository.update(
        { reviewStatus: UserEssayConstants.STATUS.IN_PROGRESS },
        { id: userEssayItem.id }
    );

    let isReviewSuccess = false;
    try {
        const review = await callApiReview(
            userEssayId,
            userEssayItem.answer,
            userEssayItem.essayItem.topic,
            userEssayItem.essayItem.systemPrompt,
            userEssay.language,
            userEssay.backgroundDescription
        );

        await UserEssayItemRepository.update(
            { review, reviewStatus: UserEssayConstants.STATUS.COMPLETED },
            { id: userEssayItem.id }
        );

        isReviewSuccess = true;
    } catch (err) {
        LogUtils.loggingError({ functionName: 'processEssayReviewItemJob', message: err.message });

        await UserEssayItemRepository.update(
            { reviewStatus: UserEssayConstants.STATUS.FAILED },
            { id: userEssayItem.id }
        );
    }

    const pendingUserEssayItemIds = jobData.pendingUserEssayItemIds;
    let itemReviewStatus = isReviewSuccess ? UserEssayConstants.STATUS.COMPLETED : UserEssayConstants.STATUS.PARTIALLY_COMPLETED;
    if (pendingUserEssayItemIds && Array.isArray(pendingUserEssayItemIds)) {
        const userEssayItems = await UserEssayItemRepository.findAll({
            id: pendingUserEssayItemIds,
            [Models.Op.or]: [
                { reviewStatus: UserEssayConstants.STATUS.PENDING },
                { reviewStatus: UserEssayConstants.STATUS.IN_PROGRESS }
            ]
        });

        if (userEssayItems.length) itemReviewStatus = UserEssayConstants.STATUS.PARTIALLY_COMPLETED;
    }
    await UserEssayRepository.update({ itemReviewStatus }, { id: userEssay.id });
}

async function processEssayReviewJob(job) {
    switch (job.name) {
    case EssayReviewConstants.JOB_NAME.OVERALL:
        processEssayReviewOverallJob(job);
        break;
    case EssayReviewConstants.JOB_NAME.ITEM:
        processEssayReviewItemJob(job);
        break;
    default:
        break;
    }
}

module.exports = (redis, defaultJobOptions) => {
    const queueName = 'EssayReview';
    const finalQueueName = `${process.env.QUEUE_PREFIX}-${queueName}`;

    const queue = new Queue(finalQueueName, { connection: redis.queue, defaultJobOptions });
    const defaultWorker = new Worker(
        finalQueueName,
        processEssayReviewJob,
        {
            connection: redis.worker,
            autorun: true,
            concurrency: 1,
            limiter: { max: 3, duration: 60 * 1000 }
        }
    );

    queue.defaultWorker = defaultWorker;

    queue.on('error', (err) => {
        LogUtils.loggingError(`Queue ${queueName} Error: ${err.message}`);
    });
    defaultWorker.on('error', (err) => {
        LogUtils.loggingError(`Worker ${queueName} Error: ${err.message}`);
    });

    queue.addDefaultJob = (data, opts) => {
        queue.add('default', data, opts);
    };

    return queue;
};
