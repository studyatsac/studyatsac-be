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
        return Response.formatServiceReturn(false, 404, null, language.MOCK_INTERVIEW.CANNOT_STARTED);
    }
    if (userInterview.status !== UserInterviewConstants.STATUS.PENDING) {
        return Response.formatServiceReturn(false, 404, null, language.MOCK_INTERVIEW.STARTED_IN_PROGRESS);
    }

    const updateData = await Models.sequelize.transaction(async (trx) => {
        const result = await UserInterviewRepository.update(
            { status: UserInterviewConstants.STATUS.IN_PROGRESS, startedAt: Moment().format() },
            { id: userInterview.id },
            trx
        );

        await MockInterviewUtils.setMockInterviewCache(input.userId, input.uuid);

        await Queues.MockInterview.add(
            MockInterviewConstants.JOB_NAME.PAUSE,
            { userInterviewId: userInterview.id },
            { delay: MockInterviewConstants.MAX_SESSION_TIME_IN_MILLISECONDS }
        );

        if (!(await AiServiceSocket.emitEventWithAck('init_speech', input.uuid))) throw new Error();

        return result;
    });
    if (!updateData) {
        return Response.formatServiceReturn(false, 500, null, language.USER_INTERVIEW.UPDATE_FAILED);
    }

    return Response.formatServiceReturn(true, 200, userInterview, null);
};

const speakMockInterview = async (input) => {
    if (!(await MockInterviewUtils.isMockInterviewRunning(input.userId, input.uuid))) return;
    AiServiceSocket.emitEvent('speech', input.uuid, input.buffer, console.log);
};

exports.getPaidMockInterviewPackage = getPaidMockInterviewPackage;
exports.startMockInterview = startMockInterview;
exports.speakMockInterview = speakMockInterview;

module.exports = exports;
