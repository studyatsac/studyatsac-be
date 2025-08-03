const { Worker } = require('bullmq');
const LogUtils = require('../../utils/logger');
const UserInterviewRepository = require('../../repositories/mysql/user_interview');
const UserInterviewSectionRepository = require('../../repositories/mysql/user_interview_item');
const UserInterviewConstants = require('../../constants/user_interview');
const CommonConstants = require('../../constants/common');
const InterviewReviewReviewLogRepository = require('../../repositories/mysql/interview_review_log');
const Models = require('../../models/mysql');
const InterviewReviewReviewConstants = require('../../constants/interview_review');
const OpenAiUtils = require('../../clients/http/open_ai');
const Queues = require('../../queues/bullmq');
const InterviewReviewReviewUtils = require('../../utils/interview_review');

async function insertInterviewReviewReviewLog(payload, data, isSuccess = false) {
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

        await InterviewReviewReviewLogRepository.create({ ...payload, metadata });
    } catch (err) {
        LogUtils.logError({ functionName: 'insertInterviewReviewReviewLog', message: err.message });
    }
}

async function callApiReview(userInterviewId, content, topic = 'Overall Interview', criteria, language, backgroundDescription) {
    try {
        const response = await OpenAiUtils.callOpenAiCompletion({
            messages: [
                {
                    role: 'system',
                    content: InterviewReviewReviewUtils.getInterviewReviewReviewSystemPrompt(
                        backgroundDescription,
                        topic,
                        CommonConstants.LANGUAGE_LABELS[language] || 'English'
                    )
                },
                {
                    role: 'user',
                    content: InterviewReviewReviewUtils.getInterviewReviewReviewUserPrompt(
                        criteria,
                        content
                    )
                }
            ]
        });

        await insertInterviewReviewReviewLog({ userInterviewId }, response, true);

        return response.choices[0].message.content;
    } catch (err) {
        await insertInterviewReviewReviewLog({ userInterviewId, notes: err.message }, err);

        throw err;
    }
}

async function processInterviewReviewReviewOverallJob(job) {
    const jobData = job.data;
    const userInterviewId = jobData.userInterviewId;
    if (!userInterviewId) return;

    const userInterview = await UserInterviewRepository.findOne(
        { id: userInterviewId },
        {
            include: {
                model: Models.UserInterviewSection,
                as: 'interviewSections',
                include: { model: Models.InterviewSection, as: 'interviewSection' }
            }
        }
    );
    if (
        !userInterview
        || userInterview.overallReviewStatus !== UserInterviewConstants.STATUS.PENDING
    ) {
        return;
    }

    try {
        await UserInterviewRepository.update(
            { overallReviewStatus: UserInterviewConstants.STATUS.IN_PROGRESS },
            { id: userInterview.id }
        );

        const overallContent = userInterview.interviewSections.reduce(
            (text, item) => `${text}\n=====
                ${item.interviewSection.topic}\n
                ${item.answer}\n=====`, ''
        );

        const overallReview = await callApiReview(userInterviewId, overallContent, 'Overall Interview', '', userInterview.language);

        await UserInterviewRepository.update(
            { overallReviewStatus: UserInterviewConstants.STATUS.COMPLETED, overallReview },
            { id: userInterview.id }
        );
    } catch (err) {
        LogUtils.logError({ functionName: 'processInterviewReviewReviewOverallJob', message: err.message });

        await UserInterviewRepository.update(
            { overallReviewStatus: UserInterviewConstants.STATUS.FAILED },
            { id: userInterview.id }
        );
    }
}

async function processInterviewReviewReviewItemJob(job) {
    const jobData = job.data;
    const userInterviewId = jobData.userInterviewId;
    const userInterviewSectionId = jobData.userInterviewSectionId;
    if (!userInterviewId || !userInterviewSectionId) return;

    const userInterview = await UserInterviewRepository.findOne({ id: userInterviewId });
    const userInterviewSection = await UserInterviewSectionRepository.findOne(
        { id: userInterviewSectionId },
        { include: { model: Models.InterviewSection, as: 'interviewSection' } }
    );
    if (
        !userInterview
        || !userInterviewSection
        || userInterviewSection.reviewStatus !== UserInterviewConstants.STATUS.PENDING
    ) {
        return;
    }

    if (userInterview.itemReviewStatus !== UserInterviewConstants.STATUS.IN_PROGRESS) {
        await UserInterviewRepository.update(
            { itemReviewStatus: UserInterviewConstants.STATUS.IN_PROGRESS },
            { id: userInterview.id }
        );
    }

    await UserInterviewSectionRepository.update(
        { reviewStatus: UserInterviewConstants.STATUS.IN_PROGRESS },
        { id: userInterviewSection.id }
    );

    let isReviewSuccess = false;
    try {
        const review = await callApiReview(
            userInterviewId,
            userInterviewSection.answer,
            userInterviewSection.interviewSection.topic,
            userInterviewSection.interviewSection.systemPrompt,
            userInterview.language,
            userInterview.backgroundDescription
        );

        await UserInterviewSectionRepository.update(
            { review, reviewStatus: UserInterviewConstants.STATUS.COMPLETED },
            { id: userInterviewSection.id }
        );

        isReviewSuccess = true;
    } catch (err) {
        LogUtils.logError({ functionName: 'processInterviewReviewReviewItemJob', message: err.message });

        await UserInterviewSectionRepository.update(
            { reviewStatus: UserInterviewConstants.STATUS.FAILED },
            { id: userInterviewSection.id }
        );
    }

    const pendingUserInterviewSectionIds = jobData.pendingUserInterviewSectionIds;
    let itemReviewStatus = isReviewSuccess ? UserInterviewConstants.STATUS.COMPLETED : UserInterviewConstants.STATUS.PARTIALLY_COMPLETED;
    if (pendingUserInterviewSectionIds && Array.isArray(pendingUserInterviewSectionIds)) {
        const userInterviewSections = await UserInterviewSectionRepository.findAll({
            id: pendingUserInterviewSectionIds,
            [Models.Op.or]: [
                { reviewStatus: UserInterviewConstants.STATUS.PENDING },
                { reviewStatus: UserInterviewConstants.STATUS.IN_PROGRESS }
            ]
        });

        if (userInterviewSections.length) itemReviewStatus = UserInterviewConstants.STATUS.PARTIALLY_COMPLETED;
    }
    await UserInterviewRepository.update({ itemReviewStatus }, { id: userInterview.id });
}

async function processInterviewReviewReviewJob(job) {
    switch (job.name) {
    case InterviewReviewReviewConstants.JOB_NAME.OVERALL:
        await processInterviewReviewReviewOverallJob(job);
        break;
    case InterviewReviewReviewConstants.JOB_NAME.ITEM:
        await processInterviewReviewReviewItemJob(job);
        break;
    default:
        break;
    }
}

module.exports = (redis) => {
    const queue = Queues.InterviewReviewReview;
    const queueName = queue.name;

    const worker = new Worker(
        queueName,
        processInterviewReviewReviewJob,
        {
            connection: redis,
            autorun: true,
            concurrency: 1,
            limiter: { max: 3, duration: 60 * 1000 }
        }
    );
    worker.on('error', (err) => {
        LogUtils.logError(`Worker ${queueName} Error: ${err.message}`);
    });

    queue.defaultWorker = worker;

    return worker;
};
