const { Worker } = require('bullmq');
const LogUtils = require('../../utils/logger');
const UserInterviewRepository = require('../../repositories/mysql/user_interview');
const UserInterviewSectionRepository = require('../../repositories/mysql/user_interview_section');
const UserInterviewSectionAnswerRepository = require('../../repositories/mysql/user_interview_section_answer');
const UserInterviewConstants = require('../../constants/user_interview');
const CommonConstants = require('../../constants/common');
const InterviewReviewLogRepository = require('../../repositories/mysql/interview_review_log');
const Models = require('../../models/mysql');
const InterviewReviewConstants = require('../../constants/interview_review');
const OpenAiUtils = require('../../clients/http/open_ai');
const Queues = require('../../queues/bullmq');
const InterviewReviewUtils = require('../../utils/interview_review');

async function insertInterviewReviewLog(payload, data, isSuccess = false) {
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

        await InterviewReviewLogRepository.create({ ...payload, metadata });
    } catch (err) {
        LogUtils.logError({ functionName: 'insertInterviewReviewLog', message: err.message });
    }
}

async function callApiReview(
    userInterviewId,
    content,
    title = 'Overall Interview',
    criteria,
    language,
    backgroundDescription
) {
    try {
        const response = await OpenAiUtils.callOpenAiCompletion({
            messages: [
                {
                    role: 'system',
                    content: InterviewReviewUtils.getInterviewReviewSystemPrompt(
                        backgroundDescription,
                        title,
                        CommonConstants.LANGUAGE_LABELS[language] || 'English'
                    )
                },
                {
                    role: 'user',
                    content: InterviewReviewUtils.getInterviewReviewUserPrompt(
                        criteria,
                        content
                    )
                }
            ]
        });

        await insertInterviewReviewLog({ userInterviewId }, response, true);

        return response.choices[0].message.content;
    } catch (err) {
        await insertInterviewReviewLog({ userInterviewId, notes: err.message }, err);

        throw err;
    }
}

async function processInterviewReviewOverallJob(job) {
    const jobData = job.data;
    const userInterviewId = jobData.userInterviewId;
    if (!userInterviewId) return;

    const userInterview = await UserInterviewRepository.findOne(
        { id: userInterviewId },
        {
            include: {
                model: Models.UserInterviewSection,
                as: 'interviewSections',
                include: [
                    { model: Models.InterviewSection, as: 'interviewSection' },
                    {
                        model: Models.UserInterviewSectionAnswer,
                        as: 'interviewSectionAnswers'
                    }
                ]
            }
        }
    );
    if (
        !userInterview
        || userInterview.overallReviewStatus !== UserInterviewConstants.REVIEW_STATUS.PENDING
    ) {
        return;
    }

    await UserInterviewRepository.update(
        { overallReviewStatus: UserInterviewConstants.REVIEW_STATUS.IN_PROGRESS },
        { id: userInterview.id }
    );

    let isReviewSuccess;
    let overallReview;
    try {
        const overallContent = userInterview.interviewSections.reduce(
            (text, item) => {
                const answer = item.interviewSectionAnswers?.reduce((answerText, answerItem) => `${answerText}\n-----
                    Pertanyaan: ${answerItem?.question || answerItem?.interviewSectionQuestion?.question || '-'}
                    -----
                    Jawaban: ${answerItem?.answer || '-'}\n-----`, '');

                return `${text}\n=====
                Sesi: ${item.interviewSection.title}
                Percakapan:
                ${answer}\n=====`;
            }, ''
        );

        overallReview = await callApiReview(
            userInterviewId,
            overallContent,
            'Overall Interview',
            '',
            userInterview.language
        );
        isReviewSuccess = true;
    } catch (err) {
        LogUtils.logError({ functionName: 'processInterviewReviewOverallJob', message: err.message });
    }

    if (isReviewSuccess) {
        await UserInterviewRepository.update(
            { overallReviewStatus: UserInterviewConstants.REVIEW_STATUS.COMPLETED, overallReview },
            { id: userInterview.id }
        );
    } else {
        await UserInterviewRepository.update(
            { overallReviewStatus: UserInterviewConstants.REVIEW_STATUS.FAILED },
            { id: userInterview.id }
        );
    }
}

async function processInterviewReviewSectionJob(job) {
    const jobData = job.data;
    const userInterviewId = jobData.userInterviewId;
    const userInterviewSectionId = jobData.userInterviewSectionId;
    if (!userInterviewId || !userInterviewSectionId) return;

    const userInterview = await UserInterviewRepository.findOne({ id: userInterviewId });
    const userInterviewSection = await UserInterviewSectionRepository.findOne(
        { id: userInterviewSectionId },
        {
            include: [
                { model: Models.InterviewSection, as: 'interviewSection' },
                {
                    model: Models.UserInterviewSectionAnswer,
                    as: 'interviewSectionAnswers'
                }
            ]
        }
    );
    if (
        !userInterview
        || !userInterviewSection
        || userInterviewSection.reviewStatus !== UserInterviewConstants.REVIEW_STATUS.PENDING
    ) {
        return;
    }

    await Models.sequelize.transaction(async (trx) => {
        if (userInterview.sectionReviewStatus !== UserInterviewConstants.REVIEW_STATUS.IN_PROGRESS) {
            await UserInterviewRepository.update(
                { sectionReviewStatus: UserInterviewConstants.REVIEW_STATUS.IN_PROGRESS },
                { id: userInterview.id },
                trx
            );
        }

        const result = await UserInterviewSectionAnswerRepository.update(
            { reviewStatus: UserInterviewConstants.REVIEW_STATUS.IN_PROGRESS },
            {
                userInterviewSectionId: userInterviewSection.id,
                reviewStatus: UserInterviewConstants.REVIEW_STATUS.PENDING
            },
            trx
        );

        await UserInterviewSectionRepository.update(
            {
                reviewStatus: UserInterviewConstants.REVIEW_STATUS.IN_PROGRESS,
                ...(((Array.isArray(result) && !!result[0]) || !!result) ? {
                    answerReviewStatus: UserInterviewConstants.REVIEW_STATUS.IN_PROGRESS
                } : {})
            },
            { id: userInterviewSection.id },
            trx
        );
    });

    let isReviewSuccess = false;
    let review;
    try {
        let content = '';
        if (userInterviewSection.interviewSectionAnswers && Array.isArray(userInterviewSection.interviewSectionAnswers)) {
            content = userInterviewSection.interviewSectionAnswers.reduce(
                (text, item) => `${text}\n=====
                    Pertanyaan: ${item?.question || item?.interviewSectionQuestion?.question || '-'}
                    -----
                    Jawaban: ${item?.answer || '-'}\n=====`, ''
            );
        }

        review = await callApiReview(
            userInterviewId,
            content,
            userInterviewSection.interviewSection.title,
            userInterviewSection.interviewSection.systemPrompt,
            userInterview.language,
            userInterview.backgroundDescription
        );
        isReviewSuccess = true;
    } catch (err) {
        LogUtils.logError({ functionName: 'processInterviewReviewSectionJob', message: err.message });
    }

    await Models.sequelize.transaction(async (trx) => {
        if (isReviewSuccess) {
            const result = await UserInterviewSectionAnswerRepository.update(
                { reviewStatus: UserInterviewConstants.REVIEW_STATUS.COMPLETED },
                {
                    userInterviewSectionId: userInterviewSection.id,
                    reviewStatus: UserInterviewConstants.REVIEW_STATUS.IN_PROGRESS
                },
                trx
            );

            await UserInterviewSectionRepository.update(
                {
                    review,
                    reviewStatus: UserInterviewConstants.REVIEW_STATUS.COMPLETED,
                    ...(((Array.isArray(result) && !!result[0]) || !!result) ? {
                        answerReviewStatus: UserInterviewConstants.REVIEW_STATUS.COMPLETED
                    } : {})
                },
                { id: userInterviewSection.id },
                trx
            );
        } else {
            const result = await UserInterviewSectionAnswerRepository.update(
                { reviewStatus: UserInterviewConstants.REVIEW_STATUS.FAILED },
                {
                    userInterviewSectionId: userInterviewSection.id,
                    reviewStatus: UserInterviewConstants.REVIEW_STATUS.IN_PROGRESS
                },
                trx
            );

            await UserInterviewSectionRepository.update(
                {
                    reviewStatus: UserInterviewConstants.REVIEW_STATUS.FAILED,
                    ...(((Array.isArray(result) && !!result[0]) || !!result) ? {
                        answerReviewStatus: UserInterviewConstants.REVIEW_STATUS.FAILED
                    } : {})
                },
                { id: userInterviewSection.id },
                trx
            );
        }
    });

    const pendingUserInterviewSectionIds = jobData.pendingUserInterviewSectionIds;
    let sectionReviewStatus = isReviewSuccess
        ? UserInterviewConstants.REVIEW_STATUS.COMPLETED
        : UserInterviewConstants.REVIEW_STATUS.PARTIALLY_COMPLETED;
    if (pendingUserInterviewSectionIds && Array.isArray(pendingUserInterviewSectionIds)) {
        const userInterviewSections = await UserInterviewSectionRepository.findAll({
            id: pendingUserInterviewSectionIds,
            [Models.Op.or]: [
                { reviewStatus: UserInterviewConstants.REVIEW_STATUS.PENDING },
                { reviewStatus: UserInterviewConstants.REVIEW_STATUS.IN_PROGRESS }
            ]
        });

        if (userInterviewSections.length) sectionReviewStatus = UserInterviewConstants.REVIEW_STATUS.PARTIALLY_COMPLETED;
    }
    await UserInterviewRepository.update({ sectionReviewStatus }, { id: userInterview.id });
}

async function processInterviewReviewJob(job) {
    switch (job.name) {
    case InterviewReviewConstants.JOB_NAME.OVERALL:
        await processInterviewReviewOverallJob(job);
        break;
    case InterviewReviewConstants.JOB_NAME.SECTION:
        await processInterviewReviewSectionJob(job);
        break;
    default:
        break;
    }
}

module.exports = (redis) => {
    const queue = Queues.InterviewReview;
    const queueName = queue.name;

    const worker = new Worker(
        queueName,
        processInterviewReviewJob,
        {
            connection: redis,
            autorun: true,
            concurrency: 1,
            limiter: { max: 1, duration: 60 * 1000 }
        }
    );
    worker.on('error', (err) => {
        LogUtils.logError(`Worker ${queueName} Error: ${err.message}`);
    });

    queue.defaultWorker = worker;

    return worker;
};
