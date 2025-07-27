const AiServiceSocket = require('../../clients/socket/ai_service');
const MockInterviewService = require('../../services/v1/mock_interview');
const LogUtils = require('../../utils/logger');
const MockInterviewUtils = require('../../utils/mock_interview');

const listenTextEvent = async (data) => {
    try {
        const {
            userId,
            id: uuid,
            counter,
            ...restData
        } = data;
        if (!(await MockInterviewUtils.isMockInterviewRunning(userId, uuid))) return;

        await MockInterviewService.recordMockInterviewText({ userId, uuid, counter }, restData);
    } catch (err) {
        LogUtils.logError({ functionName: 'listenTextEvent', message: err.message });
    }
};

module.exports = () => {
    const listeners = [listenTextEvent];

    const unsubscribeAll = AiServiceSocket.subscribeAiServiceEvent('text', (...params) => {
        listeners.forEach((listener) => listener(...params));
    });

    const listen = (callback) => listeners.push(callback);

    return {
        name: 'MockInterviewTranscription',
        listen,
        unsubscribeAll
    };
};
