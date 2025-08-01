const Moment = require('moment');
const Response = require('../../utils/response');
const ProductPackageRepository = require('../../repositories/mysql/product_package');
const ProductPackageConstants = require('../../constants/product_package');
const UserInterviewRepository = require('../../repositories/mysql/user_interview');
const UserInterviewConstants = require('../../constants/user_interview');
const MockInterviewCacheUtils = require('../../utils/mock_interview_cache');
const Models = require('../../models/mysql');
const AiServiceSocket = require('../../clients/socket/ai_service');
const Queues = require('../../queues/bullmq');
const MockInterviewConstants = require('../../constants/mock_interview');
const LogUtils = require('../../utils/logger');
const UserInterviewSectionRepository = require('../../repositories/mysql/user_interview_section');
const InterviewSectionQuestionRepository = require('../../repositories/mysql/interview_section_question');
const UserInterviewSectionAnswerRepository = require('../../repositories/mysql/user_interview_section_answer');

class MockInterviewError extends Error {}

const getPaidMockInterviewPackage = async (input, opts = {}) => {
    const language = opts.lang;

    const rawProductPackage = await ProductPackageRepository.findOneWithInterviewAttemptFormUserPurchase({
        ...input,
        type: ProductPackageConstants.TYPE.INTERVIEW,
        uuid: input.interviewPackageUuid,
        userId: input.userId,
        interviewUuid: input.interviewUuid
    });

    let productPackage = rawProductPackage;
    if (Array.isArray(rawProductPackage)) productPackage = rawProductPackage[0];
    if (!productPackage) {
        return Response.formatServiceReturn(false, 404, null, language.INTERVIEW_PACKAGE.NOT_FOUND);
    }

    return Response.formatServiceReturn(true, 200, productPackage, null);
};

const startMockInterview = async (input, opts = {}) => {
    const language = opts.lang;

    const userInterview = await UserInterviewRepository.findOne(
        { uuid: input.uuid, userId: input.userId },
        {
            include: {
                model: Models.UserInterviewSection,
                as: 'interviewSections'
            }
        }
    );
    if (!userInterview) {
        return Response.formatServiceReturn(false, 404, null, language.USER_INTERVIEW.NOT_FOUND);
    }
    if (userInterview.status === UserInterviewConstants.STATUS.NOT_STARTED) {
        return Response.formatServiceReturn(false, 404, null, language.MOCK_INTERVIEW.NOT_STARTED);
    }
    if (userInterview.status !== UserInterviewConstants.STATUS.PENDING) {
        return Response.formatServiceReturn(false, 404, null, language.MOCK_INTERVIEW.NOT_PENDING);
    }

    const targetInterviewSection = userInterview.interviewSections.find(
        (item) => item.status === UserInterviewConstants.SECTION_STATUS.PENDING
    );
    if (!targetInterviewSection) {
        return Response.formatServiceReturn(false, 404, null, language.USER_INTERVIEW_SECTION.NOT_FOUND);
    }

    let pauseJob;
    let initJob;
    try {
        await Models.sequelize.transaction(async (trx) => {
            let result = await UserInterviewRepository.update(
                {
                    status: UserInterviewConstants.STATUS.IN_PROGRESS,
                    startedAt: Moment().format(),
                    resumedAt: Moment().format()
                },
                { id: userInterview.id },
                trx
            );
            if (!result) throw new MockInterviewError(language.USER_INTERVIEW.UPDATE_FAILED);

            result = await UserInterviewSectionRepository.update(
                {
                    status: UserInterviewConstants.SECTION_STATUS.IN_PROGRESS,
                    startedAt: Moment().format(),
                    resumedAt: Moment().format()
                },
                { id: targetInterviewSection.id },
                trx
            );
            if (!result) throw new MockInterviewError(language.USER_INTERVIEW_SECTION.UPDATE_FAILED);

            const sessionId = await MockInterviewCacheUtils.generateMockInterviewSessionId(userInterview.userId, userInterview.uuid);

            initJob = await Queues.MockInterview.add(
                MockInterviewConstants.JOB_NAME.INIT,
                { userInterviewUuid: userInterview.uuid, userId: userInterview.userId },
                { delay: MockInterviewConstants.JOB_DELAY }
            );

            pauseJob = await Queues.MockInterviewControl.add(
                MockInterviewConstants.JOB_NAME.PAUSE,
                { userInterviewUuid: userInterview.uuid, userId: userInterview.userId },
                { delay: MockInterviewConstants.MAX_IDLE_TIME_IN_MILLISECONDS }
            );

            await MockInterviewCacheUtils.setMockInterviewPauseJobId(userInterview.userId, userInterview.uuid, pauseJob.id);

            if (
                !(await AiServiceSocket.emitAiServiceEventWithAck(
                    MockInterviewConstants.AI_SERVICE_EVENT_NAME.INIT_CLIENT,
                    userInterview.uuid,
                    userInterview.userId,
                    sessionId
                ))
            ) throw new Error();

            return result;
        });

        if (initJob && (await initJob.isDelayed())) await initJob.changeDelay(0);
    } catch (err) {
        if (initJob) await initJob.remove();
        if (pauseJob) await pauseJob.remove();
        await MockInterviewCacheUtils.deleteMockInterviewPauseJobId(userInterview.userId, userInterview.uuid);
        await MockInterviewCacheUtils.deleteMockInterviewSessionId(userInterview.userId, userInterview.uuid);

        if (err instanceof MockInterviewError) return Response.formatServiceReturn(false, 500, null, err.message);

        throw err;
    }

    return Response.formatServiceReturn(true, 200, userInterview, null);
};

const updateMockInterviewDuration = async (input, opts = {}) => {
    const language = opts.lang;

    const updatedData = await UserInterviewSectionRepository.updateDuration({
        uuid: input.uuid,
        userId: input.userId
    });
    if (!updatedData) throw new MockInterviewError(language.USER_INTERVIEW_SECTION.UPDATE_FAILED);

    return updatedData;
};

const pauseMockInterview = async (input, opts = {}) => {
    const language = opts.lang;

    const userInterview = await UserInterviewRepository.findOne(
        { uuid: input.uuid, userId: input.userId },
        {
            include: {
                model: Models.UserInterviewSection,
                as: 'interviewSections'
            }
        }
    );
    if (!userInterview) {
        return Response.formatServiceReturn(false, 404, null, language.USER_INTERVIEW.NOT_FOUND);
    }
    if (userInterview.status === UserInterviewConstants.STATUS.NOT_STARTED) {
        return Response.formatServiceReturn(false, 404, null, language.MOCK_INTERVIEW.NOT_STARTED);
    }
    if (userInterview.status === UserInterviewConstants.STATUS.PENDING) {
        return Response.formatServiceReturn(false, 404, null, language.MOCK_INTERVIEW.PENDING);
    }
    if (userInterview.status !== UserInterviewConstants.STATUS.IN_PROGRESS) {
        return Response.formatServiceReturn(false, 404, null, language.MOCK_INTERVIEW.NOT_IN_PROGRESS);
    }

    const sessionId = await MockInterviewCacheUtils.getMockInterviewSessionId(userInterview.userId, userInterview.uuid);

    const targetInterviewSection = userInterview.interviewSections.find(
        (item) => item.status === UserInterviewConstants.SECTION_STATUS.IN_PROGRESS
    );

    let pauseJob;
    let isUpdated = false;
    try {
        await Models.sequelize.transaction(async (trx) => {
            let result = await UserInterviewRepository.update(
                { status: UserInterviewConstants.STATUS.PAUSED, pausedAt: Moment().format() },
                { id: userInterview.id },
                trx
            );
            if (!result) throw new MockInterviewError(language.USER_INTERVIEW.UPDATE_FAILED);

            if (targetInterviewSection) {
                result = await UserInterviewSectionRepository.update(
                    {
                        status: UserInterviewConstants.SECTION_STATUS.PAUSED,
                        pausedAt: Moment().format(),
                        duration: Models.Sequelize.literal('duration + TIMESTAMPDIFF(SECOND, resumed_at, CURRENT_TIMESTAMP)')
                    },
                    { id: targetInterviewSection.id },
                    trx
                );
                if (!result) throw new MockInterviewError(language.USER_INTERVIEW_SECTION.UPDATE_FAILED);
            }

            await MockInterviewCacheUtils.deleteMockInterviewSessionId(userInterview.userId, userInterview.uuid);

            const jobId = await MockInterviewCacheUtils.getMockInterviewPauseJobId(userInterview.userId, userInterview.uuid);
            if (jobId) {
                pauseJob = await Queues.MockInterviewControl.getJob(jobId);

                if (pauseJob && !(await pauseJob.isCompleted())) {
                    await pauseJob.updateData({});
                    isUpdated = true;
                }

                await MockInterviewCacheUtils.deleteMockInterviewPauseJobId(userInterview.userId, userInterview.uuid);
            }

            if (
                !(await AiServiceSocket.emitAiServiceEventWithAck(
                    MockInterviewConstants.AI_SERVICE_EVENT_NAME.END_SPEECH,
                    sessionId
                ))
            ) throw new Error();

            return result;
        });
    } catch (err) {
        if (pauseJob) {
            if (isUpdated) await pauseJob.updateData({ userInterviewUuid: userInterview.uuid, userId: userInterview.userId });
            await MockInterviewCacheUtils.setMockInterviewPauseJobId(userInterview.userId, userInterview.uuid, pauseJob.id);
        }
        await MockInterviewCacheUtils.setMockInterviewSessionId(userInterview.userId, userInterview.uuid, sessionId);

        if (err instanceof MockInterviewError) return Response.formatServiceReturn(false, 500, null, err.message);

        throw err;
    }

    try {
        await MockInterviewCacheUtils.deleteMockInterviewSid(userInterview.userId, userInterview.uuid);
    } catch (err) {
        LogUtils.logError({ functionName: 'pauseMockInterview', message: err.message });
    }

    return Response.formatServiceReturn(true, 200, userInterview, null);
};

const continueMockInterview = async (input, opts = {}) => {
    const language = opts.lang;

    const userInterview = await UserInterviewRepository.findOne(
        { uuid: input.uuid, userId: input.userId },
        {
            include: {
                model: Models.UserInterviewSection,
                as: 'interviewSections'
            }
        }
    );
    if (!userInterview) {
        return Response.formatServiceReturn(false, 404, null, language.USER_INTERVIEW.NOT_FOUND);
    }
    if (userInterview.status === UserInterviewConstants.STATUS.NOT_STARTED) {
        return Response.formatServiceReturn(false, 404, null, language.MOCK_INTERVIEW.NOT_STARTED);
    }
    if (userInterview.status === UserInterviewConstants.STATUS.PENDING) {
        return Response.formatServiceReturn(false, 404, null, language.MOCK_INTERVIEW.PENDING);
    }
    if (userInterview.status !== UserInterviewConstants.STATUS.PAUSED) {
        return Response.formatServiceReturn(false, 404, null, language.MOCK_INTERVIEW.NOT_PAUSED);
    }

    let targetInterviewSection = userInterview.interviewSections.find(
        (item) => item.status === UserInterviewConstants.SECTION_STATUS.PAUSED
    );
    if (!targetInterviewSection) {
        targetInterviewSection = userInterview.interviewSections.find(
            (item) => item.status === UserInterviewConstants.SECTION_STATUS.NOT_STARTED
        );
    }
    if (!targetInterviewSection) {
        return Response.formatServiceReturn(false, 404, null, language.USER_INTERVIEW_SECTION.NOT_FOUND);
    }

    let initJob;
    let pauseJob;
    try {
        await Models.sequelize.transaction(async (trx) => {
            let result = await UserInterviewRepository.update(
                {
                    status: UserInterviewConstants.STATUS.IN_PROGRESS,
                    resumedAt: Moment().format()
                },
                { id: userInterview.id },
                trx
            );
            if (!result) throw new MockInterviewError(language.USER_INTERVIEW.UPDATE_FAILED);

            result = await UserInterviewSectionRepository.update(
                {
                    status: UserInterviewConstants.SECTION_STATUS.IN_PROGRESS,
                    resumedAt: Moment().format(),
                    duration: Models.Sequelize.literal('duration + TIMESTAMPDIFF(SECOND, resumed_at, CURRENT_TIMESTAMP)')
                },
                { id: targetInterviewSection.id },
                trx
            );
            if (!result) throw new MockInterviewError(language.USER_INTERVIEW_SECTION.UPDATE_FAILED);

            const sessionId = await MockInterviewCacheUtils.generateMockInterviewSessionId(userInterview.userId, userInterview.uuid);

            initJob = await Queues.MockInterview.add(
                MockInterviewConstants.JOB_NAME.INIT,
                { userInterviewUuid: userInterview.uuid, userId: userInterview.userId },
                { delay: MockInterviewConstants.JOB_DELAY }
            );

            pauseJob = await Queues.MockInterviewControl.add(
                MockInterviewConstants.JOB_NAME.PAUSE,
                { userInterviewUuid: userInterview.uuid, userId: userInterview.userId },
                { delay: MockInterviewConstants.MAX_IDLE_TIME_IN_MILLISECONDS }
            );

            await MockInterviewCacheUtils.setMockInterviewPauseJobId(userInterview.userId, userInterview.uuid, pauseJob.id);

            if (
                !(await AiServiceSocket.emitAiServiceEventWithAck(
                    MockInterviewConstants.AI_SERVICE_EVENT_NAME.INIT_CLIENT,
                    userInterview.uuid,
                    userInterview.userId,
                    sessionId
                ))
            ) throw new Error();

            return result;
        });

        if (initJob && (await initJob.isDelayed())) await initJob.changeDelay(0);
    } catch (err) {
        if (initJob) await initJob.remove();
        if (pauseJob) await pauseJob.remove();
        await MockInterviewCacheUtils.deleteMockInterviewPauseJobId(userInterview.userId, userInterview.uuid);
        await MockInterviewCacheUtils.deleteMockInterviewSessionId(userInterview.userId, userInterview.uuid);

        if (err instanceof MockInterviewError) return Response.formatServiceReturn(false, 500, null, err.message);

        throw err;
    }

    return Response.formatServiceReturn(true, 200, userInterview, null);
};

const stopMockInterview = async (input, opts = {}) => {
    const language = opts.lang;

    const userInterview = await UserInterviewRepository.findOne(
        { uuid: input.uuid, userId: input.userId },
        {
            include: {
                model: Models.UserInterviewSection,
                as: 'interviewSections'
            }
        }
    );
    if (!userInterview) {
        return Response.formatServiceReturn(false, 404, null, language.USER_INTERVIEW.NOT_FOUND);
    }
    if (userInterview.status === UserInterviewConstants.STATUS.NOT_STARTED) {
        return Response.formatServiceReturn(false, 404, null, language.MOCK_INTERVIEW.NOT_STARTED);
    }
    if (userInterview.status === UserInterviewConstants.STATUS.PENDING) {
        return Response.formatServiceReturn(false, 404, null, language.MOCK_INTERVIEW.PENDING);
    }
    if (userInterview.status !== UserInterviewConstants.STATUS.IN_PROGRESS) {
        return Response.formatServiceReturn(false, 404, null, language.MOCK_INTERVIEW.NOT_IN_PROGRESS);
    }

    const targetInterviewSections = userInterview.interviewSections.filter(
        (item) => item.status !== UserInterviewConstants.SECTION_STATUS.NOT_STARTED
    );

    const sessionId = await MockInterviewCacheUtils.getMockInterviewSessionId(userInterview.userId, userInterview.uuid);

    let job;
    let isUpdated = false;
    try {
        await Models.sequelize.transaction(async (trx) => {
            let result = await UserInterviewRepository.update(
                { status: UserInterviewConstants.STATUS.COMPLETED, completedAt: Moment().format() },
                { id: userInterview.id },
                trx
            );
            if (!result) throw new MockInterviewError(language.USER_INTERVIEW.UPDATE_FAILED);

            if (targetInterviewSections.length) {
                result = await UserInterviewSectionRepository.update(
                    {
                        status: UserInterviewConstants.SECTION_STATUS.COMPLETED,
                        completedAt: Moment().format(),
                        duration: Models.Sequelize.literal('duration + TIMESTAMPDIFF(SECOND, resumed_at, CURRENT_TIMESTAMP)')
                    },
                    { id: targetInterviewSections.map((item) => item.id) },
                    trx
                );
                if (!result) throw new MockInterviewError(language.USER_INTERVIEW_SECTION.UPDATE_FAILED);
            }

            await MockInterviewCacheUtils.deleteMockInterviewSessionId(userInterview.userId, userInterview.uuid);

            const jobId = await MockInterviewCacheUtils.getMockInterviewPauseJobId(userInterview.userId, userInterview.uuid);
            if (jobId) {
                job = await Queues.MockInterviewControl.getJob(jobId);

                if (job && !(await job.isCompleted())) {
                    await job.updateData({});
                    isUpdated = true;
                }

                await MockInterviewCacheUtils.deleteMockInterviewPauseJobId(userInterview.userId, userInterview.uuid);
            }

            if (
                !(await AiServiceSocket.emitAiServiceEventWithAck(
                    MockInterviewConstants.AI_SERVICE_EVENT_NAME.END_SPEECH,
                    sessionId
                ))
            ) throw new Error();

            return result;
        });
    } catch (err) {
        if (job) {
            if (isUpdated) await job.updateData({ userInterviewUuid: userInterview.uuid, userId: userInterview.userId });
            await MockInterviewCacheUtils.setMockInterviewPauseJobId(userInterview.userId, userInterview.uuid, job.id);
        }
        await MockInterviewCacheUtils.setMockInterviewSessionId(userInterview.userId, userInterview.uuid, sessionId);

        if (err instanceof MockInterviewError) return Response.formatServiceReturn(false, 500, null, err.message);

        throw err;
    }

    try {
        await MockInterviewCacheUtils.deleteMockInterviewSid(userInterview.userId, userInterview.uuid);
    } catch (err) {
        LogUtils.logError({ functionName: 'stopMockInterview', message: err.message });
    }

    return Response.formatServiceReturn(true, 200, userInterview, null);
};

const recordMockInterviewText = async (input, data) => {
    if (typeof data !== 'object' || !data || !!data.error) return;

    const getProcessJob = async () => {
        const jobId = await MockInterviewCacheUtils.getMockInterviewProcessJobId(input.userId, input.uuid);
        if (jobId) return Queues.MockInterview.getJob(jobId);
        return undefined;
    };
    const cancelProcessJob = async (job) => {
        const targetJob = job || (await getProcessJob());
        if (targetJob && !(await targetJob.isCompleted())) {
            await targetJob.updateData({});
            await MockInterviewCacheUtils.deleteMockInterviewProcessJobId(input.userId, input.uuid);
        }
    };
    const delayProcessJob = async (job) => {
        const targetJob = job || (await getProcessJob());
        if (targetJob && (await targetJob.isDelayed())) {
            await targetJob.changeDelay(MockInterviewConstants.RESPOND_TIME_IN_MILLISECONDS);
        }
    };
    const addProcessJob = async () => {
        const status = await MockInterviewCacheUtils.getMockInterviewStatus(input.userId, input.uuid);
        if (
            status
            && status.listenStatus === MockInterviewConstants.STATUS.LISTENING
        ) {
            return;
        }

        const job = await Queues.MockInterview.add(
            MockInterviewConstants.JOB_NAME.PROCESS,
            { userInterviewUuid: input.uuid, userId: input.userId },
            { delay: MockInterviewConstants.RESPOND_TIME_IN_MILLISECONDS }
        );

        await MockInterviewCacheUtils.setMockInterviewProcessJobId(input.userId, input.uuid, job.id);
    };
    const getSpeechDuration = (texts) => {
        let totalSpeechDuration = 0;
        if (texts && Array.isArray(texts) && texts.length > 0) {
            totalSpeechDuration = texts.reduce((accumulator, current) => accumulator + current.speechDuration, 0);
        }

        return totalSpeechDuration;
    };

    let texts;
    if (!('texts' in data) || !Array.isArray(data.texts) || data.texts.length === 0 || !data.isTalking) {
        // Have other processes
        if (input.counter > 0) return;

        texts = await MockInterviewCacheUtils.getMockInterviewSpeechTexts(input.userId, input.uuid);
        const totalSpeechDuration = getSpeechDuration(texts);
        // Less than 5 seconds of speech
        if (totalSpeechDuration < 5) return;

        const job = await getProcessJob();
        if (data.isTalking) await delayProcessJob(job);
        else if (!job && (data?.noSpeechDuration ?? 0) >= 5) await addProcessJob();

        return;
    }

    texts = await MockInterviewCacheUtils.updateMockInterviewSpeechTexts(input.userId, input.uuid, data.texts, texts);

    const totalSpeechDuration = getSpeechDuration(texts);
    // Have other processes or less than 5 seconds of speech
    if (input.counter > 0 || totalSpeechDuration < 5) return;

    const job = await getProcessJob();
    if (job) await cancelProcessJob();
    await addProcessJob(true);
};

const speakMockInterview = async (input) => {
    const sessionId = await MockInterviewCacheUtils.getMockInterviewSessionId(input.userId, input.uuid);
    if (!sessionId) return;

    let isIncremented = false;
    try {
        await MockInterviewCacheUtils.incrementMockInterviewSpeechCounter(input.userId, input.uuid);
        isIncremented = true;

        const data = await AiServiceSocket.emitAiServiceEventWithAck(
            MockInterviewConstants.AI_SERVICE_EVENT_NAME.SERVER_SPEECH,
            sessionId,
            input.buffer,
            input.language
        );

        const counter = await MockInterviewCacheUtils.decrementMockInterviewSpeechCounter(input.userId, input.uuid);

        await recordMockInterviewText({ ...input, counter }, data);
    } catch (err) {
        if (isIncremented) await MockInterviewCacheUtils.decrementMockInterviewSpeechCounter(input.userId, input.uuid);

        LogUtils.logError({ functionName: 'speakMockInterview', message: err.message });
    }
};

const recordMockInterviewProcess = async (input, data) => {
    if (typeof data !== 'object' || !data || !!data.error) return;
    // Does not contain any text
    if (!data?.fullText || !data.fullText?.trim()) return;

    const userInterview = await UserInterviewRepository.findOne(
        { uuid: input.uuid, userId: input.userId, status: UserInterviewConstants.STATUS.IN_PROGRESS },
        {
            include: {
                model: Models.UserInterviewSection,
                as: 'interviewSections',
                where: { status: UserInterviewConstants.SECTION_STATUS.IN_PROGRESS },
                limit: 1
            }
        }
    );
    if (!userInterview || userInterview.status !== UserInterviewConstants.STATUS.IN_PROGRESS) return;

    let questionId;
    if (data?.questionNumber != null && data?.questionNumber >= 0) {
        const count = await InterviewSectionQuestionRepository.countAll({ id: data.questionNumber });
        if (count) questionId = data.questionNumber;
    }

    const targetInterviewSection = userInterview.interviewSections.find(
        (item) => item.status === UserInterviewConstants.SECTION_STATUS.IN_PROGRESS
    );
    if (!targetInterviewSection) return;

    Models.sequelize.transaction(async (trx) => {
        const interviewSectionAnswer = await UserInterviewSectionAnswerRepository.create({
            userInterviewSectionId: targetInterviewSection.id,
            interviewSectionQuestionId: questionId,
            status: UserInterviewConstants.SECTION_ANSWER_STATUS.PENDING,
            questionNumber: data?.questionNumber || -1,
            question: data.fullText
        }, trx);

        await MockInterviewCacheUtils.setMockInterviewProcessTarget(input.userId, input.uuid, {
            userInterviewAnswerSectionId: interviewSectionAnswer.id,
            questionNumber: data?.questionNumber || -1,
            question: data.fullText
        });
    });
};

const recordMockInterviewSpeech = async (input, data) => {
    if (typeof data !== 'object' || !data || !!data.error) return;
    // No texts at all
    if (!data?.currentText || !data?.targetText) return;

    const processTarget = await MockInterviewCacheUtils.getMockInterviewProcessTarget(input.userId, input.uuid);
    if (!processTarget) {
        await MockInterviewCacheUtils.setMockInterviewProcessTarget(input.userId, input.uuid, {
            questionNumber: data?.questionNumber || -1,
            question: data?.targetText || ''
        });

        return;
    }
    // Not the same in processing
    if (processTarget?.questionNumber !== data?.questionNumber) return;

    if (processTarget.question === data.targetText) {
        if (processTarget.userInterviewAnswerSectionId != null) {
            Models.sequelize.transaction(async (trx) => {
                await UserInterviewSectionAnswerRepository.update({
                    status: UserInterviewConstants.SECTION_ANSWER_STATUS.ASKED,
                    askedAt: Moment().format()
                }, { id: processTarget.userInterviewAnswerSectionId }, trx);

                await MockInterviewCacheUtils.deleteMockInterviewProcessTarget(input.userId, input.uuid);
            });
        } else await MockInterviewCacheUtils.deleteMockInterviewProcessTarget(input.userId, input.uuid);

        return;
    }

    if (processTarget.question.includes(data.currentText) && processTarget.userInterviewAnswerSectionId != null) {
        await UserInterviewSectionAnswerRepository.update({
            status: UserInterviewConstants.SECTION_ANSWER_STATUS.ASKING
        }, { id: processTarget.userInterviewAnswerSectionId });
    }
};

exports.getPaidMockInterviewPackage = getPaidMockInterviewPackage;
exports.startMockInterview = startMockInterview;
exports.updateMockInterviewDuration = updateMockInterviewDuration;
exports.pauseMockInterview = pauseMockInterview;
exports.continueMockInterview = continueMockInterview;
exports.stopMockInterview = stopMockInterview;
exports.recordMockInterviewText = recordMockInterviewText;
exports.speakMockInterview = speakMockInterview;
exports.recordMockInterviewProcess = recordMockInterviewProcess;
exports.recordMockInterviewSpeech = recordMockInterviewSpeech;

module.exports = exports;
