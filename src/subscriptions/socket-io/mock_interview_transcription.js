const AiServiceSocket = require('../../clients/socket/ai_service');

module.exports = () => {
    const listeners = [];

    const unsubscribeAll = AiServiceSocket.subscribeAiServiceEvent('transcript', (...params) => {
        listeners.forEach((listener) => listener(...params));
    });

    const listen = (callback) => listeners.push(callback);

    return {
        name: 'MockInterviewTranscription',
        listen,
        unsubscribeAll
    };
};
