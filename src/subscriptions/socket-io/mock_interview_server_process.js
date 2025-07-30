const AiServiceSocket = require('../../clients/socket/ai_service');
const MockInterviewService = require('../../services/v1/mock_interview');
const LogUtils = require('../../utils/logger');
const MockInterviewCacheUtils = require('../../utils/mock_interview_cache');
const MockInterviewConstants = require('../../constants/mock_interview');

const listenServerProcessEvent = async (data) => {
    try {
        const {
            userId,
            uuid,
            ...restData
        } = data;
        if (!(await MockInterviewCacheUtils.isMockInterviewRunning(userId, uuid))) return;

        await MockInterviewService.recordMockInterviewProcess({ userId, uuid }, restData);
    } catch (err) {
        LogUtils.logError({ functionName: 'listenServerProcessEvent', message: err.message });
    }
};

module.exports = () => {
    const listeners = [listenServerProcessEvent];

    const unsubscribeAll = AiServiceSocket.subscribeAiServiceEvent(
        MockInterviewConstants.AI_SERVICE_EVENT_NAME.SERVER_PROCESS,
        (...params) => {
            listeners.forEach((listener) => listener(...params));
        }
    );

    const listen = (callback) => listeners.push(callback);

    return {
        name: 'MockInterviewServerProcess',
        listen,
        unsubscribeAll
    };
};
