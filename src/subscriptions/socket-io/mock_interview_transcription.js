const AiServiceSocket = require('../../clients/socket/ai_service');

module.exports = () => {
    const listeners = [];

    const unsubscribeAll = AiServiceSocket.subscribeEvent('transcript', (...params) => {
        listeners.forEach((listener) => listener(...params));
    });

    const listen = (callback) => listeners.push(callback);

    return {
        name: 'MockInterviewTranscription',
        listen,
        unsubscribeAll
    };
};
