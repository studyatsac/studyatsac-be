const AiServiceSocket = require('../../clients/socket/ai_service');

module.exports = () => {
    const listeners = [console.log];

    const unsubscribeAll = AiServiceSocket.subscribeTranscribeEvent((...params) => {
        listeners.forEach((listener) => listener(...params));
    });

    const listen = (callback) => listeners.push(callback);

    return {
        name: 'MockInterviewTranscription',
        listen,
        unsubscribeAll
    };
};
