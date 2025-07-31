const { Worker, DelayedError } = require('bullmq');
const Moment = require('moment');
const LogUtils = require('../../utils/logger');
const UserInterviewRepository = require('../../repositories/mysql/user_interview');
const UserInterviewConstants = require('../../constants/user_interview');
const MockInterviewConstants = require('../../constants/mock_interview');
const Models = require('../../models/mysql');
const Queues = require('../../queues/bullmq');
const MockInterviewCacheUtils = require('../../utils/mock_interview_cache');
const MockInterviewPromptUtils = require('../../utils/mock_interview_prompt');
const AiServiceSocket = require('../../clients/socket/ai_service');
const UserInterviewSectionAnswerRepository = require('../../repositories/mysql/user_interview_section_answer');
const InterviewSectionQuestionRepository = require('../../repositories/mysql/interview_section_question');

const getNotAskedInterviewSectionQuestions = (interviewSectionAnswers, interviewSectionQuestions) => {
    const notAskedInterviewSectionQuestions = [];
    if (interviewSectionAnswers && Array.isArray(interviewSectionAnswers)) {
        interviewSectionAnswers.forEach((item) => {
            const question = interviewSectionQuestions.find((questionItem) => questionItem.id === item.interviewSectionQuestionId);
            if (!question) notAskedInterviewSectionQuestions.push(question);
        });
    }

    return notAskedInterviewSectionQuestions;
};

async function processMockInterviewOpeningJob(job, token) {
    const jobData = job.data;
    const userId = jobData.userId;
    const userInterviewUuid = jobData.userInterviewUuid;
    if (!userId || !userInterviewUuid) return;

    const userInterview = await UserInterviewRepository.findOne(
        { uuid: userInterviewUuid, userId, status: UserInterviewConstants.STATUS.IN_PROGRESS },
        {
            include: {
                model: Models.UserInterviewSection,
                as: 'interviewSections',
                where: {
                    [Models.Sequelize.Op.or]: [
                        { status: UserInterviewConstants.SECTION_STATUS.IN_PROGRESS },
                        { status: UserInterviewConstants.SECTION_STATUS.COMPLETED }
                    ]
                },
                include: [
                    {
                        model: Models.InterviewSection,
                        as: 'interviewSection',
                        include: { model: Models.InterviewSectionQuestion, as: 'interviewSectionQuestions' }
                    },
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
        || userInterview.status !== UserInterviewConstants.STATUS.IN_PROGRESS
        || !userInterview?.interviewSections?.length
    ) return;

    const sessionId = await MockInterviewCacheUtils.getMockInterviewSessionId(userInterview.userId, userInterview.uuid);

    let targetInterviewSection;
    let completedInterviewSection;
    userInterview?.interviewSections?.forEach((item) => {
        if (targetInterviewSection == null && item.status === UserInterviewConstants.SECTION_STATUS.IN_PROGRESS) {
            targetInterviewSection = item;
        }
        if (completedInterviewSection == null && item.status === UserInterviewConstants.SECTION_STATUS.COMPLETED) {
            completedInterviewSection = item;
        }
    });
    if (!targetInterviewSection) return;

    let result = true;
    if (targetInterviewSection.interviewSectionAnswers?.length) {
        const lastAnswer = targetInterviewSection?.interviewSectionAnswers?.[targetInterviewSection.interviewSectionAnswers.length - 1];
        const lastQuestion = targetInterviewSection?.interviewSection?.interviewSectionQuestions?.find(
            (item) => item.id === lastAnswer?.interviewSectionQuestionId
        );

        const { prompt, hint } = MockInterviewPromptUtils.getMockInterviewContinuingSystemPrompt(
            userInterview.backgroundDescription,
            targetInterviewSection?.interviewSection?.title,
            lastQuestion?.question,
            getNotAskedInterviewSectionQuestions(
                targetInterviewSection?.interviewSectionAnswers ?? [],
                targetInterviewSection?.interviewSection?.interviewSectionQuestions ?? []
            ),
            userInterview.language
        );

        result = await AiServiceSocket.emitAiServiceEventWithAck(
            MockInterviewConstants.AI_SERVICE_EVENT_NAME.CLIENT_PROCESS,
            sessionId,
            prompt,
            lastAnswer?.answer ?? '',
            hint,
            userInterview.language,
            MockInterviewConstants.AI_SERVICE_PROCESS_EVENT_TAG.CONTINUING
        );
    } else if (completedInterviewSection) {
        const lastAnswer = completedInterviewSection?.interviewSectionAnswers?.[completedInterviewSection.interviewSectionAnswers.length - 1];
        const lastQuestion = completedInterviewSection?.interviewSection?.interviewSectionQuestions?.find(
            (item) => item.id === lastAnswer?.interviewSectionQuestionId
        );

        const { prompt, hint } = MockInterviewPromptUtils.getMockInterviewRespondTransitionSystemPrompt(
            userInterview.backgroundDescription,
            targetInterviewSection?.interviewSection?.title,
            getNotAskedInterviewSectionQuestions(
                targetInterviewSection?.interviewSectionAnswers ?? [],
                targetInterviewSection?.interviewSection?.interviewSectionQuestions ?? []
            ),
            completedInterviewSection?.interviewSection?.title,
            lastQuestion?.question,
            userInterview.language
        );

        result = await AiServiceSocket.emitAiServiceEventWithAck(
            MockInterviewConstants.AI_SERVICE_EVENT_NAME.CLIENT_PROCESS,
            sessionId,
            prompt,
            lastAnswer?.answer ?? '',
            hint,
            userInterview.language,
            MockInterviewConstants.AI_SERVICE_PROCESS_EVENT_TAG.TRANSITIONING
        );
    } else {
        const { prompt, hint } = MockInterviewPromptUtils.getMockInterviewOpeningSystemPrompt(
            userInterview.backgroundDescription,
            targetInterviewSection?.interviewSection?.title,
            getNotAskedInterviewSectionQuestions(
                targetInterviewSection?.interviewSectionAnswers ?? [],
                targetInterviewSection?.interviewSection?.interviewSectionQuestions ?? []
            ),
            userInterview.language
        );

        result = await AiServiceSocket.emitAiServiceEventWithAck(
            MockInterviewConstants.AI_SERVICE_EVENT_NAME.CLIENT_PROCESS,
            sessionId,
            prompt,
            '',
            hint,
            userInterview.language,
            MockInterviewConstants.AI_SERVICE_PROCESS_EVENT_TAG.OPENING
        );
    }
    if (!result) {
        await job.moveToDelayed(Date.now() + 1000, token);
        throw new DelayedError();
    }
}

async function processMockInterviewRespondJob(job, token) {
    const jobData = job.data;
    const userId = jobData.userId;
    const userInterviewUuid = jobData.userInterviewUuid;
    if (!userId || !userInterviewUuid) return;

    const userInterview = await UserInterviewRepository.findOne(
        { uuid: userInterviewUuid, userId, status: UserInterviewConstants.STATUS.IN_PROGRESS },
        {
            include: {
                model: Models.UserInterviewSection,
                as: 'interviewSections',
                where: { status: UserInterviewConstants.SECTION_STATUS.IN_PROGRESS },
                include: [
                    {
                        model: Models.InterviewSection,
                        as: 'interviewSection',
                        include: { model: Models.InterviewSectionQuestion, as: 'interviewSectionQuestions' }
                    },
                    {
                        model: Models.UserInterviewSectionAnswer,
                        as: 'interviewSectionAnswers'
                    }
                ],
                limit: 1,
                order: [['startedAt', 'DESC']]
            }
        }
    );
    if (!userInterview || userInterview.status !== UserInterviewConstants.STATUS.IN_PROGRESS) return;

    const sessionId = await MockInterviewCacheUtils.getMockInterviewSessionId(userInterview.userId, userInterview.uuid);

    const texts = await MockInterviewCacheUtils.getMockInterviewSpeechTexts(userInterview.userId, userInterview.uuid);
    if (!texts || !Array.isArray(texts) || texts.length === 0) return;

    const speechTextsOwner = await MockInterviewCacheUtils.getMockInterviewRespondJobId(userId, userInterviewUuid);
    if (speechTextsOwner !== job.id) return;

    const text = texts.map((item) => item?.content ?? '').filter(Boolean).join(' ');

    const targetInterviewSection = userInterview?.interviewSections?.findLast(
        (item) => item.status === UserInterviewConstants.SECTION_STATUS.IN_PROGRESS
    );
    if (!targetInterviewSection) return;

    let additionalPayload = {};
    const processTarget = await MockInterviewCacheUtils.getMockInterviewProcessTarget(userId, userInterviewUuid);
    if (processTarget && processTarget?.userInterviewSectionAnswerId == null) {
        let questionId;
        if (processTarget?.questionNumber != null && processTarget?.questionNumber >= 0) {
            const count = await InterviewSectionQuestionRepository.countAll({ id: processTarget.questionNumber });
            if (count) questionId = processTarget.questionNumber;
        }
        additionalPayload = {
            interviewSectionQuestionId: questionId,
            question: processTarget?.question,
            questionNumber: processTarget?.questionNumber
        };
    }

    await Models.sequelize.transaction(async (trx) => {
        await AiServiceSocket.emitAiServiceEventWithAck(
            MockInterviewConstants.AI_SERVICE_EVENT_NAME.RESET_CLIENT,
            sessionId
        );

        let targetAnswer = targetInterviewSection?.interviewSectionAnswers?.findLast(
            (item) => (processTarget?.userInterviewSectionAnswerId == null
                ? item?.status !== UserInterviewConstants.SECTION_ANSWER_STATUS.ANSWERED
                : (processTarget?.userInterviewSectionAnswerId === item.id
                    && item?.status !== UserInterviewConstants.SECTION_ANSWER_STATUS.ANSWERED))
        );
        const hasAnswer = !!targetAnswer;
        if (!hasAnswer) {
            targetAnswer = await UserInterviewSectionAnswerRepository.create(
                {
                    userInterviewSectionId: targetInterviewSection.id,
                    answer: text,
                    status: UserInterviewConstants.SECTION_ANSWER_STATUS.ANSWERED,
                    answeredAt: Moment().format(),
                    ...additionalPayload
                },
                trx
            );
        } else {
            await UserInterviewSectionAnswerRepository.update(
                {
                    answer: text,
                    status: UserInterviewConstants.SECTION_ANSWER_STATUS.ANSWERED,
                    answeredAt: Moment().format(),
                    ...additionalPayload
                },
                { id: targetAnswer?.id },
                trx
            );
        }

        const lastQuestion = targetInterviewSection?.interviewSection?.interviewSectionQuestions?.find(
            (item) => item.id === targetAnswer?.interviewSectionQuestionId
        );

        const { prompt, hint } = MockInterviewPromptUtils.getMockInterviewRespondSystemPrompt(
            userInterview.backgroundDescription,
            userInterview.topic,
            lastQuestion?.question || targetAnswer?.question || '',
            getNotAskedInterviewSectionQuestions(
                targetInterviewSection?.interviewSectionAnswers ?? [],
                targetInterviewSection?.interviewSection?.interviewSectionQuestions ?? []
            ),
            userInterview.language
        );
        const result = await AiServiceSocket.emitAiServiceEventWithAck(
            MockInterviewConstants.AI_SERVICE_EVENT_NAME.CLIENT_PROCESS,
            sessionId,
            prompt,
            text,
            hint,
            userInterview.language,
            MockInterviewConstants.AI_SERVICE_PROCESS_EVENT_TAG.RESPONDING
        );
        if (!result) {
            await job.moveToDelayed(Date.now() + 1000, token);
            throw new DelayedError();
        }

        await MockInterviewCacheUtils.deleteMockInterviewSpeechTexts(userId, userInterviewUuid);
        await MockInterviewCacheUtils.deleteMockInterviewRespondJobId(userId, userInterviewUuid);
    });
}

async function processMockInterviewJob(job, token) {
    switch (job.name) {
    case MockInterviewConstants.JOB_NAME.OPENING:
        await processMockInterviewOpeningJob(job, token);
        break;
    case MockInterviewConstants.JOB_NAME.RESPOND:
        await processMockInterviewRespondJob(job, token);
        break;
    default:
        break;
    }
}

module.exports = (redis) => {
    const queue = Queues.MockInterview;
    const queueName = queue.name;

    const worker = new Worker(
        queueName,
        processMockInterviewJob,
        { connection: redis, autorun: true }
    );
    worker.on('error', (err) => {
        LogUtils.logError(`Worker ${queueName} Error: ${err.message}`);
    });

    queue.defaultWorker = worker;

    return worker;
};
