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
const SocketServer = require('../../servers/socket/main');

function getNotAskedInterviewSectionQuestions(interviewSectionAnswers, interviewSectionQuestions) {
    const notAskedInterviewSectionQuestions = [];
    if (interviewSectionQuestions && Array.isArray(interviewSectionQuestions)) {
        interviewSectionQuestions.forEach((questionItem) => {
            const answer = interviewSectionAnswers?.find((item) => questionItem.id === item.interviewSectionQuestionId);
            if (!answer) notAskedInterviewSectionQuestions.push(questionItem);
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
                where: { status: UserInterviewConstants.STATUS.IN_PROGRESS },
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
                        { status: UserInterviewConstants.STATUS.IN_PROGRESS },
                        { status: UserInterviewConstants.STATUS.COMPLETED }
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

function createProcessJobValidator(expectedJobId, userId, userInterviewUuid) {
    const expected = expectedJobId != null ? String(expectedJobId) : null;

    return async () => {
        if (!expected) return { active: true, callerId: null };

        try {
            const stored = await MockInterviewCacheUtils.getMockInterviewProcessJobId(userId, userInterviewUuid);
            if (stored == null) return { active: false, callerId: null };
            const storedStr = String(stored);
            const active = storedStr === expected;
            return { active, callerId: active ? storedStr : null };
        } catch {
            return { active: false, callerId: null };
        }
    };
}

function getRetryDelay(attempt = 1, base = 1000, max = 5000) {
    // eslint-disable-next-line no-restricted-properties -- Fine to use pow
    return Math.min(base * Math.pow(2, Math.max(0, attempt - 1)), max);
}

async function handleRetryOrStop({
    job,
    token,
    userInterview,
    callerId,
    jobName,
    opts = {}
}) {
    const maxAttempts = opts.maxAttempts ?? 3;
    const baseDelay = opts.baseDelay ?? 1000;
    const maxDelay = opts.maxDelay ?? 5000;

    const attemptsMade = (job && typeof job === 'object' && typeof job?.attemptsMade === 'number')
        ? job.attemptsMade + 1
        // eslint-disable-next-line no-underscore-dangle -- Fine to use dangling
        : (job?.data?.__retryCount ?? 1);

    if (attemptsMade >= maxAttempts) {
        try {
            await MockInterviewCacheUtils.setMockInterviewControlPauseJobTime(
                userInterview.userId,
                userInterview.uuid,
                Date.now() + 1000
            );

            try {
                await MockInterviewCacheUtils.deleteMockInterviewProcessJobId(userInterview.userId, userInterview.uuid);
            } catch {
                // Do nothing
            }

            const clientSid = await MockInterviewCacheUtils.getMockInterviewSid(userInterview.userId, userInterview.uuid);
            if (clientSid) SocketServer.emitEventToClient(clientSid, MockInterviewConstants.EVENT_NAME.PAUSE);
        } catch {
            // Do nothing
        }

        return;
    }

    const delay = getRetryDelay(attemptsMade, baseDelay, maxDelay);
    if (job && token) {
        await job.moveToDelayed(Date.now() + delay, token);
        throw new DelayedError();
    }

    await Queues.MockInterview.add(
        jobName,
        {
            userInterviewUuid: userInterview.uuid,
            userId: userInterview.userId,
            callerId,
            __retryCount: attemptsMade
        },
        {
            delay,
            attempts: maxAttempts,
            backoff: { type: 'exponential', delay: baseDelay }
        }
    );
}

async function processMockInterviewOpen(
    sessionId,
    userInterview,
    targetInterviewSection,
    checkShouldTerminate,
    job,
    token
) {
    const validation = (typeof checkShouldTerminate === 'function') ? await checkShouldTerminate() : { active: true, callerId: null };
    if (!validation?.active) return;
    const callerId = validation?.callerId ?? null;

    let language = userInterview.language;
    if (targetInterviewSection?.language) language = targetInterviewSection.language;
    const systemPrompt = MockInterviewPromptUtils.getMockInterviewSystemPrompt(
        userInterview.backgroundDescription,
        targetInterviewSection?.interviewSection?.title,
        language
    );
    const { prompt, hint } = MockInterviewPromptUtils.getMockInterviewOpeningUserPrompt(
        targetInterviewSection?.interviewSection?.title,
        language
    );

    const result = await AiServiceSocket.emitAiServiceEventWithAck(
        MockInterviewConstants.AI_SERVICE_EVENT_NAME.CLIENT_PROCESS,
        sessionId,
        systemPrompt,
        prompt,
        hint,
        [],
        language,
        MockInterviewConstants.PROCESS_EVENT_TAG.OPENING
    );
    if (result) return;

    await handleRetryOrStop({
        job,
        token,
        userInterview,
        callerId,
        jobName: MockInterviewConstants.JOB_NAME.OPEN
    });
}

async function processMockInterviewOpenJob(job, token) {
    const jobData = job.data;
    const userId = jobData.userId;
    const userInterviewUuid = jobData.userInterviewUuid;
    if (!userId || !userInterviewUuid) return;

    const target = await getTargetUserInterviewSectionSession(userId, userInterviewUuid);
    if (!target) return;

    const { sessionId, targetInterviewSection, userInterview } = target;
    await processMockInterviewOpen(
        sessionId,
        userInterview,
        targetInterviewSection,
        createProcessJobValidator(jobData.callerId, userId, userInterviewUuid),
        job,
        token
    );
}

async function processMockInterviewContinue(
    sessionId,
    userInterview,
    targetInterviewSection,
    checkShouldTerminate,
    job,
    token
) {
    const validation = (typeof checkShouldTerminate === 'function') ? await checkShouldTerminate() : { active: true, callerId: null };
    if (!validation?.active) return;
    const callerId = validation?.callerId ?? null;

    const lastAnswer = targetInterviewSection?.interviewSectionAnswers?.[
        targetInterviewSection.interviewSectionAnswers.length - 1
    ];
    const lastQuestion = targetInterviewSection?.interviewSection?.interviewSectionQuestions?.find(
        (item) => item.id === lastAnswer?.interviewSectionQuestionId
    );

    let language = userInterview.language;
    if (targetInterviewSection?.language) language = targetInterviewSection.language;
    const systemPrompt = MockInterviewPromptUtils.getMockInterviewSystemPrompt(
        userInterview.backgroundDescription,
        targetInterviewSection?.interviewSection?.title,
        language
    );
    const { prompt, hint } = MockInterviewPromptUtils.getMockInterviewContinuingUserPrompt(
        lastQuestion?.question,
        lastAnswer?.answer ?? '',
        getNotAskedInterviewSectionQuestions(
            targetInterviewSection?.interviewSectionAnswers ?? [],
            targetInterviewSection?.interviewSection?.interviewSectionQuestions ?? []
        ),
        language
    );

    let history = targetInterviewSection?.interviewSectionAnswers?.flatMap(
        (item) => [
            [MockInterviewConstants.PROCESS_EVENT_HISTORY_ROLE.ASSISTANT, item?.question ?? ''],
            [MockInterviewConstants.PROCESS_EVENT_HISTORY_ROLE.USER, item?.answer || '']
        ]
    ) || [];
    const previousHistory = await MockInterviewCacheUtils.getMockInterviewProcessHistory(
        userInterview.userId,
        userInterview.uuid
    );
    if (previousHistory && Array.isArray(previousHistory)) history = [...previousHistory, ...(history || [])];

    const result = await AiServiceSocket.emitAiServiceEventWithAck(
        MockInterviewConstants.AI_SERVICE_EVENT_NAME.CLIENT_PROCESS,
        sessionId,
        systemPrompt,
        prompt,
        hint,
        history,
        language,
        MockInterviewConstants.PROCESS_EVENT_TAG.CONTINUING
    );
    if (result) return;

    await handleRetryOrStop({
        job,
        token,
        userInterview,
        callerId,
        jobName: MockInterviewConstants.JOB_NAME.CONTINUE
    });
}

async function processMockInterviewContinueJob(job, token) {
    const jobData = job.data;
    const userId = jobData.userId;
    const userInterviewUuid = jobData.userInterviewUuid;
    if (!userId || !userInterviewUuid) return;

    const target = await getTargetUserInterviewSectionSession(userId, userInterviewUuid);
    if (!target) return;

    const { sessionId, targetInterviewSection, userInterview } = target;
    await processMockInterviewContinue(
        sessionId,
        userInterview,
        targetInterviewSection,
        createProcessJobValidator(jobData.callerId, userId, userInterviewUuid),
        job,
        token
    );
}

async function processMockInterviewRespond(
    sessionId,
    userInterview,
    targetInterviewSection,
    checkShouldTerminate,
    job,
    token
) {
    const validation = (typeof checkShouldTerminate === 'function') ? await checkShouldTerminate() : { active: true, callerId: null };
    if (!validation?.active) return;
    const callerId = validation?.callerId ?? null;

    const lastAnswer = targetInterviewSection?.interviewSectionAnswers?.[
        targetInterviewSection.interviewSectionAnswers.length - 1
    ];

    await AiServiceSocket.emitAiServiceEventWithAck(
        MockInterviewConstants.AI_SERVICE_EVENT_NAME.RESET_CLIENT,
        sessionId
    );

    let language = userInterview.language;
    if (targetInterviewSection?.language) language = targetInterviewSection.language;
    const systemPrompt = MockInterviewPromptUtils.getMockInterviewSystemPrompt(
        userInterview.backgroundDescription,
        targetInterviewSection?.interviewSection?.title,
        language
    );
    const { prompt, hint } = MockInterviewPromptUtils.getMockInterviewRespondUserPrompt(
        lastAnswer?.answer ?? '',
        getNotAskedInterviewSectionQuestions(
            targetInterviewSection?.interviewSectionAnswers ?? [],
            targetInterviewSection?.interviewSection?.interviewSectionQuestions ?? []
        ),
        language
    );

    let history = targetInterviewSection?.interviewSectionAnswers?.flatMap(
        (item) => [
            [MockInterviewConstants.PROCESS_EVENT_HISTORY_ROLE.ASSISTANT, item?.question ?? ''],
            [MockInterviewConstants.PROCESS_EVENT_HISTORY_ROLE.USER, item?.answer || '']
        ]
    ) || [];
    const previousHistory = await MockInterviewCacheUtils.getMockInterviewProcessHistory(
        userInterview.userId,
        userInterview.uuid
    );
    if (previousHistory && Array.isArray(previousHistory)) history = [...previousHistory, ...(history || [])];

    const result = await AiServiceSocket.emitAiServiceEventWithAck(
        MockInterviewConstants.AI_SERVICE_EVENT_NAME.CLIENT_PROCESS,
        sessionId,
        systemPrompt,
        prompt,
        hint,
        history,
        language,
        MockInterviewConstants.PROCESS_EVENT_TAG.RESPONDING
    );
    if (result) return;

    await handleRetryOrStop({
        job,
        token,
        userInterview,
        callerId,
        jobName: MockInterviewConstants.JOB_NAME.RESPOND
    });
}

async function processMockInterviewRespondJob(job, token) {
    const jobData = job.data;
    const userId = jobData.userId;
    const userInterviewUuid = jobData.userInterviewUuid;
    if (!userId || !userInterviewUuid) return;

    const target = await getTargetUserInterviewSectionSession(userId, userInterviewUuid);
    if (!target) return;

    const { sessionId, targetInterviewSection, userInterview } = target;
    await processMockInterviewRespond(
        sessionId,
        userInterview,
        targetInterviewSection,
        createProcessJobValidator(jobData.callerId, userId, userInterviewUuid),
        job,
        token
    );
}

async function processMockInterviewRespondTransition(
    sessionId,
    userInterview,
    completedInterviewSection,
    targetInterviewSection,
    checkShouldTerminate,
    job,
    token
) {
    const validation = (typeof checkShouldTerminate === 'function') ? await checkShouldTerminate() : { active: true, callerId: null };
    if (!validation?.active) return;
    const callerId = validation?.callerId ?? null;

    const lastAnswer = completedInterviewSection?.interviewSectionAnswers?.[
        completedInterviewSection.interviewSectionAnswers.length - 1
    ];
    const lastQuestion = completedInterviewSection?.interviewSection?.interviewSectionQuestions?.find(
        (item) => item.id === lastAnswer?.interviewSectionQuestionId
    );

    let language = userInterview.language;
    if (targetInterviewSection?.language) language = targetInterviewSection.language;
    const systemPrompt = MockInterviewPromptUtils.getMockInterviewSystemPrompt(
        userInterview.backgroundDescription,
        targetInterviewSection?.interviewSection?.title,
        language
    );
    const { prompt, hint } = MockInterviewPromptUtils.getMockInterviewRespondTransitionUserPrompt(
        completedInterviewSection?.interviewSection?.title,
        lastQuestion?.question || lastAnswer?.question || '',
        lastAnswer?.answer ?? '',
        getNotAskedInterviewSectionQuestions(
            targetInterviewSection?.interviewSectionAnswers ?? [],
            targetInterviewSection?.interviewSection?.interviewSectionQuestions ?? []
        ),
        language
    );

    let history = [
        ...(completedInterviewSection?.interviewSectionAnswers ?? []),
        ...(targetInterviewSection?.interviewSectionAnswers ?? [])
    ].flatMap(
        (item) => [
            [MockInterviewConstants.PROCESS_EVENT_HISTORY_ROLE.ASSISTANT, item?.question ?? ''],
            [MockInterviewConstants.PROCESS_EVENT_HISTORY_ROLE.USER, item?.answer || '']
        ]
    ) || [];
    const previousHistory = await MockInterviewCacheUtils.getMockInterviewProcessHistory(
        userInterview.userId,
        userInterview.uuid
    );
    if (previousHistory && Array.isArray(previousHistory)) history = [...previousHistory, ...(history || [])];

    const result = await AiServiceSocket.emitAiServiceEventWithAck(
        MockInterviewConstants.AI_SERVICE_EVENT_NAME.CLIENT_PROCESS,
        sessionId,
        systemPrompt,
        prompt,
        hint,
        history,
        language,
        MockInterviewConstants.PROCESS_EVENT_TAG.TRANSITIONING
    );
    if (result) return;

    await handleRetryOrStop({
        job,
        token,
        userInterview,
        callerId,
        jobName: MockInterviewConstants.JOB_NAME.RESPOND_TRANSITION
    });
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
        createProcessJobValidator(jobData.callerId, userId, userInterviewUuid),
        job,
        token
    );
}

async function processMockInterviewClose(
    sessionId,
    userInterview,
    targetInterviewSection,
    checkShouldTerminate,
    job,
    token
) {
    const validation = (typeof checkShouldTerminate === 'function') ? await checkShouldTerminate() : { active: true, callerId: null };
    if (!validation?.active) return;
    const callerId = validation?.callerId ?? null;

    const lastAnswer = targetInterviewSection?.interviewSectionAnswers?.[
        targetInterviewSection.interviewSectionAnswers.length - 1
    ];

    let language = userInterview.language;
    if (targetInterviewSection?.language) language = targetInterviewSection.language;
    const systemPrompt = MockInterviewPromptUtils.getMockInterviewSystemPrompt(
        userInterview.backgroundDescription,
        targetInterviewSection?.interviewSection?.title,
        language
    );
    const { prompt, hint } = MockInterviewPromptUtils.getMockInterviewClosingUserPrompt(
        lastAnswer?.answer ?? '',
        language
    );

    let history = targetInterviewSection?.interviewSectionAnswers?.flatMap(
        (item) => [
            [MockInterviewConstants.PROCESS_EVENT_HISTORY_ROLE.ASSISTANT, item?.question ?? ''],
            [MockInterviewConstants.PROCESS_EVENT_HISTORY_ROLE.USER, item?.answer || '']
        ]
    ) || [];
    const previousHistory = await MockInterviewCacheUtils.getMockInterviewProcessHistory(
        userInterview.userId,
        userInterview.uuid
    );
    if (previousHistory && Array.isArray(previousHistory)) history = [...previousHistory, ...(history || [])];

    const result = await AiServiceSocket.emitAiServiceEventWithAck(
        MockInterviewConstants.AI_SERVICE_EVENT_NAME.CLIENT_PROCESS,
        sessionId,
        systemPrompt,
        prompt,
        hint,
        history,
        language,
        MockInterviewConstants.PROCESS_EVENT_TAG.CLOSING
    );
    if (result) return;

    await handleRetryOrStop({
        job,
        token,
        userInterview,
        callerId,
        jobName: MockInterviewConstants.JOB_NAME.CLOSE
    });
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
        createProcessJobValidator(jobData.callerId, userId, userInterviewUuid),
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

    const checkShouldTerminate = createProcessJobValidator(job.id, userId, userInterviewUuid);
    const validation = await checkShouldTerminate();
    if (!validation?.active) return;

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

    let shouldEmitControl = false;
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
            targetAnswer.interviewSectionQuestionId = payload.interviewSectionQuestionId
                || targetAnswer.interviewSectionQuestionId;
            targetAnswer.question = payload.question || targetAnswer.question;
            targetAnswer.questionNumber = payload.questionNumber || targetAnswer.questionNumber;
            targetAnswer.status = payload.status;
            targetInterviewSection.interviewSectionAnswers[targetAnswerIndex] = targetAnswer;
        }

        if ((targetInterviewSection?.duration ?? 0) >= (targetInterviewSection?.interviewSection?.duration ?? 0)) {
            shouldEmitControl = true;

            let result = await UserInterviewSectionRepository.update(
                {
                    status: UserInterviewConstants.SECTION_STATUS.COMPLETED,
                    completedAt: Moment().format()
                },
                { id: targetInterviewSection.id },
                trx
            );
            if ((Array.isArray(result) && !result[0]) || !result) {
                throw new Error();
            }

            const newTargetInterviewSection = await UserInterviewSectionRepository.findOne(
                {
                    userInterviewId: userInterview.id,
                    status: UserInterviewConstants.SECTION_STATUS.PENDING
                },
                {
                    include: {
                        model: Models.InterviewSection,
                        as: 'interviewSection',
                        include: {
                            required: false,
                            model: Models.InterviewSectionQuestion,
                            as: 'interviewSectionQuestions'
                        }
                    }
                },
                trx
            );
            if (newTargetInterviewSection) {
                await MockInterviewCacheUtils.deleteMockInterviewProcessTransitionChecker(
                    userId,
                    userInterviewUuid
                );

                result = await UserInterviewSectionRepository.update(
                    {
                        status: UserInterviewConstants.SECTION_STATUS.IN_PROGRESS,
                        startedAt: Moment().format(),
                        resumedAt: Moment().format()
                    },
                    { id: newTargetInterviewSection.id },
                    trx
                );
                if ((Array.isArray(result) && !result[0]) || !result) {
                    throw new Error();
                }

                await processMockInterviewRespondTransition(
                    sessionId,
                    userInterview,
                    targetInterviewSection,
                    newTargetInterviewSection,
                    checkShouldTerminate
                );
            } else {
                await MockInterviewCacheUtils.setMockInterviewControlStopJobTime(
                    userInterview.userId,
                    userInterview.uuid,
                    Date.now() + (MockInterviewConstants.STOP_DELAY_TIME_IN_MILLISECONDS * 2)
                );

                await processMockInterviewClose(
                    sessionId,
                    userInterview,
                    targetInterviewSection,
                    checkShouldTerminate
                );
            }
        } else {
            await processMockInterviewRespond(
                sessionId,
                userInterview,
                targetInterviewSection,
                checkShouldTerminate
            );
        }

        await MockInterviewCacheUtils.deleteMockInterviewSpeechTexts(userId, userInterviewUuid);
        await MockInterviewCacheUtils.deleteMockInterviewProcessJobId(userId, userInterviewUuid);
    });

    if (!shouldEmitControl) return;

    const clientSid = await MockInterviewCacheUtils.getMockInterviewSid(userId, userInterviewUuid);
    if (!clientSid) return;

    SocketServer.emitEventToClient(clientSid, MockInterviewConstants.EVENT_NAME.CONTROL);
}

async function processMockInterviewJob(job, token) {
    switch (job.name) {
    case MockInterviewConstants.JOB_NAME.INIT:
        await processMockInterviewInitJob(job);
        break;
    case MockInterviewConstants.JOB_NAME.PROCESS:
        await processMockInterviewProcessJob(job);
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
