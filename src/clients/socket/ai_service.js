const socket = require('socket.io-client');
const LogUtils = require('../../utils/logger');

let aiServiceSocket;
const closeCallbacks = {};
if (!aiServiceSocket) {
    aiServiceSocket = socket.connect(process.env.AI_SERVICE_SOCKET_URL);

    aiServiceSocket.on('connect', () => {
        LogUtils.logDebug('ai service socket connected');
        closeCallbacks.disconnect = () => aiServiceSocket?.disconnect();
    });
    aiServiceSocket.on('connect_error', (reason) => {
        LogUtils.logError('ai service socket connection error', reason);
        delete closeCallbacks.disconnect;
    });
    aiServiceSocket.on('disconnect', (reason) => {
        LogUtils.logDebug('ai service socket disconnected', reason);
        delete closeCallbacks.disconnect;
    });
}

const closeSocket = () => {
    Object.values(closeCallbacks).forEach((callback) => {
        if (typeof callback !== 'function') return;
        callback?.();
    });
};

const emitSpeechEvent = (userInterviewUuid, buffer) => {
    aiServiceSocket?.emit('speech', buffer, userInterviewUuid);
};

let transcriptionSubscriptionCounter = 0;
const subscribeTranscribeEvent = (callback) => {
    aiServiceSocket?.on('transcript', callback);

    const unsubscribe = () => aiServiceSocket?.off('transcript', callback);

    transcriptionSubscriptionCounter += 1;
    const closeCallbackName = `transcript${transcriptionSubscriptionCounter}`;
    closeCallbacks[closeCallbackName] = () => aiServiceSocket?.off('transcript', callback);

    return () => {
        unsubscribe();
        delete closeCallbacks[closeCallbackName];
    };
};

exports.aiServiceSocket = aiServiceSocket;
exports.closeSocket = closeSocket;
exports.emitSpeechEvent = emitSpeechEvent;
exports.subscribeTranscribeEvent = subscribeTranscribeEvent;

module.exports = exports;
