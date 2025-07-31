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
const UserInterviewSectionRepository = require('../../repositories/mysql/user_interview_section');

async function getNotAskedInterviewSectionQuestions(interviewSectionAnswers, interviewSectionQuestions) {
    const notAskedInterviewSectionQuestions = [];
    if (interviewSectionAnswers && Array.isArray(interviewSectionAnswers)) {
        interviewSectionAnswers.forEach((item) => {
            const question = interviewSectionQuestions.find((questionItem) => questionItem.id === item.interviewSectionQuestionId);
            if (!question) notAskedInterviewSectionQuestions.push(question);
        });
    }

    return notAskedInterviewSectionQuestions;
}

async function getTargetUserInterviewSectionSession(userId, userInterviewUuid) {
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
                ]
            }
        }
    );
    if (
        !userInterview
        || userInterview.status !== UserInterviewConstants.STATUS.IN_PROGRESS
        || !userInterview?.interviewSections?.length
    ) return null;

    const sessionId = await MockInterviewCacheUtils.getMockInterviewSessionId(userInterview.userId, userInterview.uuid);

    const targetInterviewSection = userInterview?.interviewSections?.findLast(
        (item) => item.status === UserInterviewConstants.SECTION_STATUS.IN_PROGRESS
    );
    if (!targetInterviewSection) return null;

    return { userInterview, targetInterviewSection, sessionId };
}

async function getCompletedTargetUserInterviewSectionSession(userId, userInterviewUuid) {
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
    ) return null;

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
    if (!targetInterviewSection) return null;

    return {
        userInterview,
        targetInterviewSection,
        completedInterviewSection,
        sessionId
    };
}

async function processMockInterviewOpen(sessionId, userInterview, targetInterviewSection, job, token) {
    const { prompt, hint } = MockInterviewPromptUtils.getMockInterviewOpeningSystemPrompt(
        userInterview.backgroundDescription,
        targetInterviewSection?.interviewSection?.title,
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
        '',
        hint,
        userInterview.language,
        MockInterviewConstants.AI_SERVICE_PROCESS_EVENT_TAG.OPENING
    );
    if (result) return;

    const delay = 1000;
    if (job && token) {
        await job.moveToDelayed(Date.now() + delay, token);
        throw new DelayedError();
    } else {
        await Queues.MockInterview.add(
            MockInterviewConstants.JOB_NAME.OPENING,
            { userInterviewUuid: userInterview.uuid, userId: userInterview.userId },
            { delay }
        );
    }
}

async function processMockInterviewOpenJob(job, token) {
    const jobData = job.data;
    const userId = jobData.userId;
    const userInterviewUuid = jobData.userInterviewUuid;
    if (!userId || !userInterviewUuid) return;

    const target = await getTargetUserInterviewSectionSession(userId, userInterviewUuid);
    if (!target) return;

    const { sessionId, targetInterviewSection, userInterview } = target;
    await processMockInterviewOpen(sessionId, userInterview, targetInterviewSection, job, token);
}

async function processMockInterviewContinue(
    sessionId,
    userInterview,
    targetInterviewSection,
    job,
    token
) {
    const lastAnswer = targetInterviewSection?.interviewSectionAnswers?.[
        targetInterviewSection.interviewSectionAnswers.length - 1
    ];
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

    const result = await AiServiceSocket.emitAiServiceEventWithAck(
        MockInterviewConstants.AI_SERVICE_EVENT_NAME.CLIENT_PROCESS,
        sessionId,
        prompt,
        lastAnswer?.answer ?? '',
        hint,
        userInterview.language,
        MockInterviewConstants.AI_SERVICE_PROCESS_EVENT_TAG.CONTINUING
    );
    if (result) return;

    const delay = 1000;
    if (job && token) {
        await job.moveToDelayed(Date.now() + delay, token);
        throw new DelayedError();
    } else {
        await Queues.MockInterview.add(
            MockInterviewConstants.JOB_NAME.CONTINUE,
            { userInterviewUuid: userInterview.uuid, userId: userInterview.userId },
            { delay }
        );
    }
}

async function processMockInterviewContinueJob(job, token) {
    const jobData = job.data;
    const userId = jobData.userId;
    const userInterviewUuid = jobData.userInterviewUuid;
    if (!userId || !userInterviewUuid) return;

    const target = await getTargetUserInterviewSectionSession(userId, userInterviewUuid);
    if (!target) return;

    const { sessionId, targetInterviewSection, userInterview } = target;
    await processMockInterviewContinue(sessionId, userInterview, targetInterviewSection, job, token);
}

async function processMockInterviewRespond(
    sessionId,
    userInterview,
    targetInterviewSection,
    job,
    token
) {
    const lastAnswer = targetInterviewSection?.interviewSectionAnswers?.[
        targetInterviewSection.interviewSectionAnswers.length - 1
    ];
    const lastQuestion = targetInterviewSection?.interviewSection?.interviewSectionQuestions?.find(
        (item) => item.id === lastAnswer?.interviewSectionQuestionId
    );

    await AiServiceSocket.emitAiServiceEventWithAck(
        MockInterviewConstants.AI_SERVICE_EVENT_NAME.RESET_CLIENT,
        sessionId
    );

    const { prompt, hint } = MockInterviewPromptUtils.getMockInterviewRespondSystemPrompt(
        userInterview.backgroundDescription,
        userInterview.topic,
        lastQuestion?.question || lastAnswer?.question || '',
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
        lastAnswer?.answer ?? '',
        hint,
        userInterview.language,
        MockInterviewConstants.AI_SERVICE_PROCESS_EVENT_TAG.RESPONDING
    );
    if (result) return;

    const delay = 1000;
    if (job && token) {
        await job.moveToDelayed(Date.now() + delay, token);
        throw new DelayedError();
    } else {
        await Queues.MockInterview.add(
            MockInterviewConstants.JOB_NAME.RESPOND,
            { userInterviewUuid: userInterview.uuid, userId: userInterview.userId },
            { delay }
        );
    }
}

async function processMockInterviewRespondJob(job, token) {
    const jobData = job.data;
    const userId = jobData.userId;
    const userInterviewUuid = jobData.userInterviewUuid;
    if (!userId || !userInterviewUuid) return;

    const target = await getTargetUserInterviewSectionSession(userId, userInterviewUuid);
    if (!target) return;

    const { sessionId, targetInterviewSection, userInterview } = target;
    await processMockInterviewRespond(sessionId, userInterview, targetInterviewSection, job, token);
}

async function processMockInterviewRespondTransition(
    sessionId,
    userInterview,
    completedInterviewSection,
    targetInterviewSection,
    job,
    token
) {
    const lastAnswer = completedInterviewSection?.interviewSectionAnswers?.[
        completedInterviewSection.interviewSectionAnswers.length - 1
    ];
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

    const result = await AiServiceSocket.emitAiServiceEventWithAck(
        MockInterviewConstants.AI_SERVICE_EVENT_NAME.CLIENT_PROCESS,
        sessionId,
        prompt,
        lastAnswer?.answer ?? '',
        hint,
        userInterview.language,
        MockInterviewConstants.AI_SERVICE_PROCESS_EVENT_TAG.TRANSITIONING
    );
    if (result) return;

    const delay = 1000;
    if (job && token) {
        await job.moveToDelayed(Date.now() + delay, token);
        throw new DelayedError();
    } else {
        await Queues.MockInterview.add(
            MockInterviewConstants.JOB_NAME.RESPOND_TRANSITION,
            { userInterviewUuid: userInterview.uuid, userId: userInterview.userId },
            { delay }
        );
    }
}

async function processMockInterviewRespondTransitionJob(job, token) {
    const jobData = job.data;
    const userId = jobData.userId;
    const userInterviewUuid = jobData.userInterviewUuid;
    if (!userId || !userInterviewUuid) return;

    const target = await getCompletedTargetUserInterviewSectionSession(userId, userInterviewUuid);
    if (!target) return;

    const {
        sessionId,
        targetInterviewSection,
        completedInterviewSection,
        userInterview
    } = target;
    await processMockInterviewRespondTransition(
        sessionId,
        userInterview,
        completedInterviewSection,
        targetInterviewSection,
        job,
        token
    );
}

async function processMockInterviewClose(
    sessionId,
    userInterview,
    targetInterviewSection,
    job,
    token
) {
    const lastAnswer = targetInterviewSection?.interviewSectionAnswers?.[
        targetInterviewSection.interviewSectionAnswers.length - 1
    ];
    const lastQuestion = targetInterviewSection?.interviewSection?.interviewSectionQuestions?.find(
        (item) => item.id === lastAnswer?.interviewSectionQuestionId
    );

    const { prompt, hint } = MockInterviewPromptUtils.getMockInterviewClosingSystemPrompt(
        userInterview.backgroundDescription,
        targetInterviewSection?.interviewSection?.title,
        lastQuestion?.question,
        userInterview.language
    );

    const result = await AiServiceSocket.emitAiServiceEventWithAck(
        MockInterviewConstants.AI_SERVICE_EVENT_NAME.CLIENT_PROCESS,
        sessionId,
        prompt,
        lastAnswer?.answer ?? '',
        hint,
        userInterview.language,
        MockInterviewConstants.AI_SERVICE_PROCESS_EVENT_TAG.CLOSING
    );
    if (result) return;

    const delay = 1000;
    if (job && token) {
        await job.moveToDelayed(Date.now() + delay, token);
        throw new DelayedError();
    } else {
        await Queues.MockInterview.add(
            MockInterviewConstants.JOB_NAME.CONTINUE,
            { userInterviewUuid: userInterview.uuid, userId: userInterview.userId },
            { delay }
        );
    }
}

async function processMockInterviewCloseJob(job, token) {
    const jobData = job.data;
    const userId = jobData.userId;
    const userInterviewUuid = jobData.userInterviewUuid;
    if (!userId || !userInterviewUuid) return;

    const target = await getTargetUserInterviewSectionSession(userId, userInterviewUuid);
    if (!target) return;

    const { sessionId, targetInterviewSection, userInterview } = target;
    await processMockInterviewClose(
        sessionId,
        userInterview,
        targetInterviewSection,
        job,
        token
    );
}

async function processMockInterviewInitJob(job) {
    const jobData = job.data;
    const userId = jobData.userId;
    const userInterviewUuid = jobData.userInterviewUuid;
    if (!userId || !userInterviewUuid) return;

    const target = await getCompletedTargetUserInterviewSectionSession(userId, userInterviewUuid);
    if (!target) return;

    const {
        sessionId,
        targetInterviewSection,
        completedInterviewSection,
        userInterview
    } = target;

    if (targetInterviewSection.interviewSectionAnswers?.length) {
        await processMockInterviewContinue(sessionId, userInterview, targetInterviewSection);
    } else if (completedInterviewSection) {
        await processMockInterviewRespondTransition(
            sessionId,
            userInterview,
            completedInterviewSection,
            targetInterviewSection
        );
    } else {
        await processMockInterviewOpen(sessionId, userInterview, targetInterviewSection);
    }
}

async function processMockInterviewProcessJob(job) {
    const jobData = job.data;
    const userId = jobData.userId;
    const userInterviewUuid = jobData.userInterviewUuid;
    if (!userId || !userInterviewUuid) return;

    const target = await getTargetUserInterviewSectionSession(userId, userInterviewUuid);
    if (!target) return;

    const { sessionId, targetInterviewSection, userInterview } = target;

    const texts = await MockInterviewCacheUtils.getMockInterviewSpeechTexts(userInterview.userId, userInterview.uuid);
    if (!texts || !Array.isArray(texts) || texts.length === 0) return;

    const speechTextsOwner = await MockInterviewCacheUtils.getMockInterviewProcessJobId(userId, userInterviewUuid);
    if (speechTextsOwner !== job.id) return;

    const text = texts.map((item) => item?.content ?? '').filter(Boolean).join(' ');

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
        const targetAnswerIndex = targetInterviewSection?.interviewSectionAnswers?.findLastIndex(
            (item) => (processTarget?.userInterviewSectionAnswerId == null
                ? item?.status !== UserInterviewConstants.SECTION_ANSWER_STATUS.ANSWERED
                : (processTarget?.userInterviewSectionAnswerId === item.id
                    && item?.status !== UserInterviewConstants.SECTION_ANSWER_STATUS.ANSWERED))
        );
        if (targetAnswerIndex < 0) {
            const newAnswer = await UserInterviewSectionAnswerRepository.create(
                {
                    userInterviewSectionId: targetInterviewSection.id,
                    answer: text,
                    status: UserInterviewConstants.SECTION_ANSWER_STATUS.ANSWERED,
                    answeredAt: Moment().format(),
                    ...additionalPayload
                },
                trx
            );

            if (targetInterviewSection?.interviewSectionAnswers?.length) {
                targetInterviewSection.interviewSectionAnswers = [];
            }
            targetInterviewSection.interviewSectionAnswers.push(newAnswer);
        } else {
            const targetAnswer = targetInterviewSection?.interviewSectionAnswers?.[targetAnswerIndex];
            const payload = {
                answer: text,
                status: UserInterviewConstants.SECTION_ANSWER_STATUS.ANSWERED,
                answeredAt: Moment().format(),
                ...additionalPayload
            };
            await UserInterviewSectionAnswerRepository.update(payload, { id: targetAnswer?.id }, trx);

            if (!targetInterviewSection?.interviewSectionAnswers?.length) {
                targetInterviewSection.interviewSectionAnswers = [];
            }

            targetAnswer.answer = payload.answer;
            targetAnswer.interviewSectionQuestionId = payload.interviewSectionQuestionId;
            targetAnswer.question = payload.question;
            targetAnswer.questionNumber = payload.questionNumber;
            targetAnswer.status = payload.status;
            targetInterviewSection.interviewSectionAnswers[targetAnswerIndex] = targetAnswer;
        }

        const currentTime = Moment().valueOf();
        const startTime = Moment(targetInterviewSection.startedAt).valueOf();
        if (Math.floor(Math.abs((currentTime - startTime) / 1000)) >= targetInterviewSection.duration) {
            let updatedData = await UserInterviewSectionRepository.update(
                { status: UserInterviewConstants.SECTION_STATUS.COMPLETED, completedAt: Moment().format() },
                { id: targetInterviewSection.id },
                trx
            );
            if (!updatedData) throw new Error();

            const newTargetInterviewSection = await UserInterviewSectionRepository.findOne(
                {
                    userInterviewId: userInterview.id,
                    status: UserInterviewConstants.SECTION_STATUS.PENDING
                },
                {
                    include: {
                        model: Models.InterviewSection,
                        as: 'interviewSection',
                        include: { model: Models.InterviewSectionQuestion, as: 'interviewSectionQuestions' }
                    }
                },
                trx
            );
            if (newTargetInterviewSection) {
                updatedData = await UserInterviewSectionRepository.update(
                    { status: UserInterviewConstants.SECTION_STATUS.IN_PROGRESS, startedAt: Moment().format() },
                    { id: newTargetInterviewSection.id },
                    trx
                );
                if (!updatedData) throw new Error();

                await processMockInterviewRespondTransition(
                    sessionId,
                    userInterview,
                    targetInterviewSection,
                    newTargetInterviewSection
                );
            } else {
                updatedData = await UserInterviewRepository.update(
                    { status: UserInterviewConstants.SECTION_STATUS.COMPLETED, completedAt: Moment().format() },
                    { id: userInterview.id },
                    trx
                );
                if (!updatedData) throw new Error();

                await processMockInterviewClose(sessionId, userInterview, targetInterviewSection);
            }
        } else {
            await processMockInterviewRespond(sessionId, userInterview, targetInterviewSection);
        }

        await MockInterviewCacheUtils.deleteMockInterviewSpeechTexts(userId, userInterviewUuid);
        await MockInterviewCacheUtils.deleteMockInterviewProcessJobId(userId, userInterviewUuid);
    });
}

async function processMockInterviewJob(job, token) {
    switch (job.name) {
    case MockInterviewConstants.JOB_NAME.INIT:
        await processMockInterviewInitJob(job, token);
        break;
    case MockInterviewConstants.JOB_NAME.PROCESS:
        await processMockInterviewProcessJob(job, token);
        break;
    case MockInterviewConstants.JOB_NAME.OPEN:
        await processMockInterviewOpenJob(job, token);
        break;
    case MockInterviewConstants.JOB_NAME.RESPOND:
        await processMockInterviewRespondJob(job, token);
        break;
    case MockInterviewConstants.JOB_NAME.CONTINUE:
        await processMockInterviewContinueJob(job, token);
        break;
    case MockInterviewConstants.JOB_NAME.RESPOND_TRANSITION:
        await processMockInterviewRespondTransitionJob(job, token);
        break;
    case MockInterviewConstants.JOB_NAME.CLOSE:
        await processMockInterviewCloseJob(job, token);
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
