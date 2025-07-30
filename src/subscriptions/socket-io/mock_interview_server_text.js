const AiServiceSocket = require('../../clients/socket/ai_service');
const MockInterviewService = require('../../services/v1/mock_interview');
const LogUtils = require('../../utils/logger');
const MockInterviewCacheUtils = require('../../utils/mock_interview_cache');
const MockInterviewConstants = require('../../constants/mock_interview');

const listenServerTextEvent = async (data) => {
    try {
        const {
            userId,
            uuid,
            listeningCount: counter,
            ...restData
        } = data;
        if (!(await MockInterviewCacheUtils.isMockInterviewRunning(userId, uuid))) return;

        await MockInterviewService.recordMockInterviewText({ userId, uuid, counter }, restData);
    } catch (err) {
        LogUtils.logError({ functionName: 'listenServerTextEvent', message: err.message });
    }
};

module.exports = () => {
    const listeners = [listenServerTextEvent];

    const unsubscribeAll = AiServiceSocket.subscribeAiServiceEvent(
        MockInterviewConstants.AI_SERVICE_EVENT_NAME.SERVER_TEXT,
        (...params) => {
            listeners.forEach((listener) => listener(...params));
        }
    );

    const listen = (callback) => listeners.push(callback);

    return {
        name: 'MockInterviewServerText',
        listen,
        unsubscribeAll
    };
};
