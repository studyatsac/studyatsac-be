const { Queue, Worker } = require('bullmq');
const LogUtils = require('../../utils/logger');
const PromptUtils = require('../../utils/prompt');
const UserEssayRepository = require('../../repositories/mysql/user_essay');
const UserEssayItemRepository = require('../../repositories/mysql/user_essay_item');
const UserEssayConstants = require('../../constants/user_essay');
const Models = require('../../models/mysql');

async function callApiReview(content, topic = 'Overall Essay', criteria, language) {
    const baseUrl = process.env.OPENAI_API_URL;
    const key = process.env.OPENAI_API_KEY;

    if (!baseUrl || !key) return '';

    const response = await fetch(`${baseUrl}/v1/chat/completions`, {
        method: 'POST',
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: PromptUtils.getReviewSystemPrompt(
                        topic,
                        criteria,
                        UserEssayConstants.LANGUAGE_LABELS[language] || 'English'
                    )
                },
                { role: 'user', content }
            ],
            temperature: 0.3,
            max_tokens: 16384
        }),
        headers: {
            Authorization: `Bearer ${key}`,
            'Content-Type': 'application/json'
        }
    });

    const data = await response.json();
    return data.choices[0].message.content;
}

async function processEssayReviewJob(job) {
    const dataId = job.data;

    if (!dataId) return;

    const userEssay = await UserEssayRepository.findOne(
        { id: dataId },
        {
            include: {
                model: Models.UserEssayItem,
                as: 'essayItems',
                include: {
                    model: Models.EssayItem,
                    as: 'essayItem'
                }
            }
        }
    );
    if (
        !userEssay
        || userEssay.itemReviewStatus !== UserEssayConstants.STATUS.PENDING
        || userEssay.overallReviewStatus !== UserEssayConstants.STATUS.PENDING
    ) {
        return;
    }

    const pendingEssayItems = userEssay.essayItems.filter(
        (item) => item.reviewStatus === UserEssayConstants.STATUS.PENDING
    );
    const completedPendingEssayIds = [];
    let isItemReviewCompleted = false;
    let isOverallReviewCompleted = false;
    try {
        if (pendingEssayItems.length) {
            await UserEssayRepository.update(
                { itemReviewStatus: UserEssayConstants.STATUS.IN_PROGRESS },
                { id: userEssay.id }
            );

            const pendingPromises = pendingEssayItems.map(async (essayItem) => {
                await UserEssayItemRepository.update(
                    { reviewStatus: UserEssayConstants.STATUS.IN_PROGRESS },
                    { id: essayItem.id }
                );

                let reviewStatus = false;
                try {
                    const review = await callApiReview(
                        essayItem.answer,
                        essayItem.essayItem.topic,
                        essayItem.essayItem.systemPrompt,
                        userEssay.language
                    );

                    await UserEssayItemRepository.update(
                        { review, reviewStatus: UserEssayConstants.STATUS.COMPLETED },
                        { id: essayItem.id }
                    );

                    reviewStatus = true;
                } catch (err) {
                    LogUtils.loggingError({ functionName: 'processEssayReviewJob Inner Item', message: err.message });

                    await UserEssayItemRepository.update(
                        { reviewStatus: UserEssayConstants.STATUS.FAILED },
                        { id: essayItem.id }
                    );

                    reviewStatus = false;
                }

                completedPendingEssayIds.push(essayItem.id);

                return reviewStatus;
            });

            const pendingResults = await Promise.all(pendingPromises);

            let itemReviewStatus = UserEssayConstants.STATUS.FAILED;
            if (pendingResults && Array.isArray(pendingResults)) {
                itemReviewStatus = pendingResults.every(Boolean)
                    ? UserEssayConstants.STATUS.COMPLETED
                    : UserEssayConstants.STATUS.PARTIALLY_COMPLETED;
            }
            await UserEssayRepository.update(
                { itemReviewStatus },
                { id: userEssay.id }
            );

            isItemReviewCompleted = true;
        }

        try {
            const overallContent = userEssay.essayItems.reduce(
                (text, item) => `${text}\n=====
                ${item.essayItem.topic}\n
                ${item.answer}\n=====`, ''
            );

            const overallReview = await callApiReview(overallContent, 'Overall Essay', '', userEssay.language);

            await UserEssayRepository.update(
                { overallReviewStatus: UserEssayConstants.STATUS.COMPLETED, overallReview },
                { id: userEssay.id }
            );
        } catch (err) {
            LogUtils.loggingError({ functionName: 'processEssayReviewJob Inner', message: err.message });

            await UserEssayRepository.update(
                { overallReviewStatus: UserEssayConstants.STATUS.FAILED },
                { id: userEssay.id }
            );
        }

        isOverallReviewCompleted = true;
    } catch (err) {
        LogUtils.loggingError({ functionName: 'processEssayReviewJob', message: err.message });

        let shouldUpdate = false;
        const dataToUpdate = {};

        if (!isItemReviewCompleted) {
            shouldUpdate = true;
            dataToUpdate.itemReviewStatus = UserEssayConstants.STATUS.FAILED;
        }
        if (!isOverallReviewCompleted) {
            shouldUpdate = true;
            dataToUpdate.overallReviewStatus = UserEssayConstants.STATUS.FAILED;
        }

        if (shouldUpdate) await UserEssayRepository.update(dataToUpdate, { id: userEssay.id });

        const errorPendingEssayItems = pendingEssayItems.filter(
            (item) => !completedPendingEssayIds.includes(item.id)
        );
        if (errorPendingEssayItems.length) {
            await UserEssayItemRepository.update(
                { reviewStatus: UserEssayConstants.STATUS.FAILED },
                { id: errorPendingEssayItems.map((item) => item.id) }
            );
        }
    }
}

module.exports = (redis, defaultJobOptions) => {
    const queueName = 'EssayReview';

    const queue = new Queue(queueName, { connection: redis.queue, defaultJobOptions });
    const defaultWorker = new Worker(
        queueName,
        processEssayReviewJob,
        { connection: redis.worker, autorun: true, concurrency: 5 }
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
