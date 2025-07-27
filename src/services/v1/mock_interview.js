const Moment = require('moment');
const Response = require('../../utils/response');
const ProductPackageRepository = require('../../repositories/mysql/product_package');
const ProductPackageConstants = require('../../constants/product_package');
const UserInterviewRepository = require('../../repositories/mysql/user_interview');
const UserInterviewConstants = require('../../constants/user_interview');
const MockInterviewUtils = require('../../utils/mock_interview');
const Models = require('../../models/mysql');
const AiServiceSocket = require('../../clients/socket/ai_service');
const Queues = require('../../queues/bullmq');
const MockInterviewConstants = require('../../constants/mock_interview');
const LogUtils = require('../../utils/logger');
const SocketServer = require('../../servers/socket/main');

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

    const userInterview = await UserInterviewRepository.findOne({ uuid: input.uuid, userId: input.userId });
    if (!userInterview) {
        return Response.formatServiceReturn(false, 404, null, language.USER_INTERVIEW.NOT_FOUND);
    }
    if (userInterview.status === UserInterviewConstants.STATUS.NOT_STARTED) {
        return Response.formatServiceReturn(false, 404, null, language.MOCK_INTERVIEW.NOT_STARTED);
    }
    if (userInterview.status !== UserInterviewConstants.STATUS.PENDING) {
        return Response.formatServiceReturn(false, 404, null, language.MOCK_INTERVIEW.NOT_PENDING);
    }

    let job;
    try {
        const updateData = await Models.sequelize.transaction(async (trx) => {
            const result = await UserInterviewRepository.update(
                { status: UserInterviewConstants.STATUS.IN_PROGRESS, startedAt: Moment().format() },
                { id: userInterview.id },
                trx
            );

            const sessionId = await MockInterviewUtils.generateMockInterviewSessionId(userInterview.userId, userInterview.uuid);

            job = await Queues.MockInterview.add(
                MockInterviewConstants.JOB_NAME.PAUSE,
                { userInterviewUuid: userInterview.uuid, userId: userInterview.userId },
                { delay: MockInterviewConstants.MAX_IDLE_TIME_IN_MILLISECONDS }
            );

            await MockInterviewUtils.setMockInterviewPauseJobId(userInterview.userId, userInterview.uuid, job.id);

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
        if (!updateData) {
            return Response.formatServiceReturn(false, 500, null, language.USER_INTERVIEW.UPDATE_FAILED);
        }
    } catch (err) {
        if (job) await job.remove();
        await MockInterviewUtils.deleteMockInterviewPauseJobId(userInterview.userId, userInterview.uuid);
        await MockInterviewUtils.deleteMockInterviewSessionId(userInterview.userId, userInterview.uuid);

        throw err;
    }

    return Response.formatServiceReturn(true, 200, userInterview, null);
};

const pauseMockInterview = async (input, opts = {}) => {
    const language = opts.lang;

    const userInterview = await UserInterviewRepository.findOne({ uuid: input.uuid, userId: input.userId });
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

    const sessionId = await MockInterviewUtils.getMockInterviewSessionId(userInterview.userId, userInterview.uuid);

    let job;
    let isUpdated = false;
    try {
        const updateData = await Models.sequelize.transaction(async (trx) => {
            const result = await UserInterviewRepository.update(
                { status: UserInterviewConstants.STATUS.PAUSED, pausedAt: Moment().format() },
                { id: userInterview.id },
                trx
            );

            await MockInterviewUtils.deleteMockInterviewSessionId(userInterview.userId, userInterview.uuid);

            const jobId = await MockInterviewUtils.getMockInterviewPauseJobId(userInterview.userId, userInterview.uuid);
            if (jobId) {
                job = await Queues.MockInterview.getJob(jobId);

                if (job && !(await job.isCompleted())) {
                    await job.updateData({});
                    isUpdated = true;
                }

                await MockInterviewUtils.deleteMockInterviewPauseJobId(userInterview.userId, userInterview.uuid);
            }

            if (
                !(await AiServiceSocket.emitAiServiceEventWithAck(
                    MockInterviewConstants.AI_SERVICE_EVENT_NAME.END_SPEECH,
                    sessionId
                ))
            ) throw new Error();

            return result;
        });

        if (!updateData) {
            return Response.formatServiceReturn(false, 500, null, language.USER_INTERVIEW.UPDATE_FAILED);
        }
    } catch (err) {
        if (job) {
            if (isUpdated) await job.updateData({ userInterviewUuid: userInterview.uuid, userId: userInterview.userId });
            await MockInterviewUtils.setMockInterviewPauseJobId(userInterview.userId, userInterview.uuid, job.id);
        }
        await MockInterviewUtils.setMockInterviewSessionId(userInterview.userId, userInterview.uuid, sessionId);

        throw err;
    }

    try {
        await MockInterviewUtils.deleteMockInterviewSid(userInterview.userId, userInterview.uuid);
    } catch (err) {
        LogUtils.logError({ functionName: 'pauseMockInterview', message: err.message });
    }

    return Response.formatServiceReturn(true, 200, userInterview, null);
};

const continueMockInterview = async (input, opts = {}) => {
    const language = opts.lang;

    const userInterview = await UserInterviewRepository.findOne({ uuid: input.uuid, userId: input.userId });
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

    let job;
    try {
        const updateData = await Models.sequelize.transaction(async (trx) => {
            const result = await UserInterviewRepository.update(
                { status: UserInterviewConstants.STATUS.IN_PROGRESS },
                { id: userInterview.id },
                trx
            );

            const sessionId = await MockInterviewUtils.generateMockInterviewSessionId(userInterview.userId, userInterview.uuid);

            job = await Queues.MockInterview.add(
                MockInterviewConstants.JOB_NAME.PAUSE,
                { userInterviewUuid: userInterview.uuid, userId: userInterview.userId },
                { delay: MockInterviewConstants.MAX_IDLE_TIME_IN_MILLISECONDS }
            );

            await MockInterviewUtils.setMockInterviewPauseJobId(userInterview.userId, userInterview.uuid, job.id);

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
        if (!updateData) {
            return Response.formatServiceReturn(false, 500, null, language.USER_INTERVIEW.UPDATE_FAILED);
        }
    } catch (err) {
        if (job) await job.remove();
        await MockInterviewUtils.deleteMockInterviewPauseJobId(userInterview.userId, userInterview.uuid);
        await MockInterviewUtils.deleteMockInterviewSessionId(userInterview.userId, userInterview.uuid);

        throw err;
    }

    return Response.formatServiceReturn(true, 200, userInterview, null);
};

const stopMockInterview = async (input, opts = {}) => {
    const language = opts.lang;

    const userInterview = await UserInterviewRepository.findOne({ uuid: input.uuid, userId: input.userId });
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

    const sessionId = await MockInterviewUtils.getMockInterviewSessionId(userInterview.userId, userInterview.uuid);

    let job;
    let isUpdated = false;
    try {
        const updateData = await Models.sequelize.transaction(async (trx) => {
            const result = await UserInterviewRepository.update(
                { status: UserInterviewConstants.STATUS.COMPLETED, completedAt: Moment().format() },
                { id: userInterview.id },
                trx
            );

            await MockInterviewUtils.deleteMockInterviewSessionId(userInterview.userId, userInterview.uuid);

            const jobId = await MockInterviewUtils.getMockInterviewPauseJobId(userInterview.userId, userInterview.uuid);
            if (jobId) {
                job = await Queues.MockInterview.getJob(jobId);

                if (job && !(await job.isCompleted())) {
                    await job.updateData({});
                    isUpdated = true;
                }

                await MockInterviewUtils.deleteMockInterviewPauseJobId(userInterview.userId, userInterview.uuid);
            }

            if (
                !(await AiServiceSocket.emitAiServiceEventWithAck(
                    MockInterviewConstants.AI_SERVICE_EVENT_NAME.END_SPEECH,
                    sessionId
                ))
            ) throw new Error();

            return result;
        });
        if (!updateData) {
            return Response.formatServiceReturn(false, 500, null, language.USER_INTERVIEW.UPDATE_FAILED);
        }
    } catch (err) {
        if (job) {
            if (isUpdated) await job.updateData({ userInterviewUuid: userInterview.uuid, userId: userInterview.userId });
            await MockInterviewUtils.setMockInterviewPauseJobId(userInterview.userId, userInterview.uuid, job.id);
        }
        await MockInterviewUtils.setMockInterviewSessionId(userInterview.userId, userInterview.uuid, sessionId);

        throw err;
    }

    try {
        await MockInterviewUtils.deleteMockInterviewSid(userInterview.userId, userInterview.uuid);
    } catch (err) {
        LogUtils.logError({ functionName: 'stopMockInterview', message: err.message });
    }

    return Response.formatServiceReturn(true, 200, userInterview, null);
};

const recordMockInterviewText = async (input, data) => {
    if (typeof data !== 'object' || !data || !!data.error) return;

    const getRespondJob = async () => {
        const jobId = await MockInterviewUtils.getMockInterviewRespondJobId(input.userId, input.uuid);
        if (jobId) return Queues.MockInterview.getJob(jobId);
        return undefined;
    };
    const cancelRespondJob = async (job) => {
        const targetJob = job || (await getRespondJob());
        if (targetJob && !(await targetJob.isCompleted())) {
            await targetJob.updateData({});
            await MockInterviewUtils.deleteMockInterviewRespondJobId(input.userId, input.uuid);
        }
    };
    const delayRespondJob = async (job) => {
        const targetJob = job || (await getRespondJob());
        if (targetJob && (await targetJob.isDelayed())) {
            await targetJob.changeDelay(MockInterviewConstants.RESPOND_TIME_IN_MILLISECONDS);
        }
    };
    const addRespondJob = async () => {
        const job = await Queues.MockInterview.add(
            MockInterviewConstants.JOB_NAME.RESPOND,
            { userInterviewUuid: input.uuid, userId: input.userId },
            { delay: MockInterviewConstants.RESPOND_TIME_IN_MILLISECONDS }
        );

        await MockInterviewUtils.setMockInterviewRespondJobId(input.userId, input.uuid, job.id);
    };
    const getSpeechDuration = (texts) => {
        let totalSpeechDuration = 0;
        if (texts && Array.isArray(texts) && texts.length > 0) {
            totalSpeechDuration = texts.reduce((accumulator, current) => accumulator + current.speechDuration, 0);
        }

        return totalSpeechDuration;
    };

    let shouldAddRespondJob = input.counter === 0;
    let texts;
    if (!('texts' in data) || !Array.isArray(data.texts) || data.texts.length === 0 || !data.isTalking) {
        texts = await MockInterviewUtils.getMockInterviewSpeechTexts(input.userId, input.uuid);
        const totalSpeechDuration = getSpeechDuration(texts);

        shouldAddRespondJob = shouldAddRespondJob
            && !data.isTalking
            // More than 5 seconds of speech
            && totalSpeechDuration > 5;
        if (shouldAddRespondJob) {
            const job = await addRespondJob();
            if (job) await delayRespondJob(job);
            else await addRespondJob();
        } else if (data.isTalking) await cancelRespondJob();

        if (data.isTalking && input.sid != null) {
            SocketServer.emitEventToClient(
                input.sid,
                MockInterviewConstants.EVENT_NAME.STATUS,
                MockInterviewConstants.STATUS.LISTENING
            );
        }

        return;
    }

    texts = await MockInterviewUtils.updateMockInterviewSpeechTexts(input.userId, input.uuid, data.texts, texts);

    const totalSpeechDuration = getSpeechDuration(texts);
    // More than 5 seconds of speech
    if (shouldAddRespondJob && totalSpeechDuration > 5) {
        const job = await getRespondJob();
        if (job) await cancelRespondJob();
        await addRespondJob(true);
    }

    const jobId = await MockInterviewUtils.getMockInterviewPauseJobId(input.userId, input.uuid);
    if (!jobId) return;

    const job = await Queues.MockInterview.getJob(jobId);
    if (!job || !(await job.isDelayed())) return;

    await MockInterviewUtils.setMockInterviewPauseJobId(input.userId, input.uuid, jobId);
    await job.changeDelay(MockInterviewConstants.MAX_IDLE_TIME_IN_MILLISECONDS);
};

const speakMockInterview = async (input) => {
    const sessionId = await MockInterviewUtils.getMockInterviewSessionId(input.userId, input.uuid);
    if (!sessionId) return;

    let isIncremented = false;
    try {
        if (input.sid != null) await MockInterviewUtils.setMockInterviewSid(input.userId, input.uuid, input.sid);

        await MockInterviewUtils.incrementMockInterviewSpeechCounter(input.userId, input.uuid);
        isIncremented = true;

        const data = await AiServiceSocket.emitAiServiceEventWithAck(
            MockInterviewConstants.AI_SERVICE_EVENT_NAME.SPEECH,
            sessionId,
            input.buffer,
            input.language
        );

        const counter = await MockInterviewUtils.decrementMockInterviewSpeechCounter(input.userId, input.uuid);

        await recordMockInterviewText({ ...input, counter }, data);
    } catch (err) {
        if (isIncremented) await MockInterviewUtils.decrementMockInterviewSpeechCounter(input.userId, input.uuid);

        LogUtils.logError({ functionName: 'speakMockInterview', message: err.message });
    }
};

exports.getPaidMockInterviewPackage = getPaidMockInterviewPackage;
exports.startMockInterview = startMockInterview;
exports.pauseMockInterview = pauseMockInterview;
exports.continueMockInterview = continueMockInterview;
exports.stopMockInterview = stopMockInterview;
exports.recordMockInterviewText = recordMockInterviewText;
exports.speakMockInterview = speakMockInterview;

module.exports = exports;
