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
        LogUtils.logError('ai service socket connection error', reason?.message ?? reason);
        delete closeCallbacks.disconnect;
    });
    aiServiceSocket.on('disconnect', (reason) => {
        LogUtils.logDebug('ai service socket disconnected', reason?.message ?? reason);
        delete closeCallbacks.disconnect;
    });
}

const closeSocket = () => {
    Object.values(closeCallbacks).forEach((callback) => {
        if (typeof callback !== 'function') return;
        callback?.();
    });
};

const emitEvent = (event, ...params) => {
    aiServiceSocket?.emit(event, ...params);
};

const emitEventWithAck = async (event, ...params) => aiServiceSocket?.emitWithAck(event, ...params);

let transcriptionSubscriptionCounter = 0;
const subscribeEvent = (event, callback) => {
    aiServiceSocket?.on(event, callback);

    const unsubscribe = () => aiServiceSocket?.off(event, callback);

    transcriptionSubscriptionCounter += 1;
    const closeCallbackName = `${event}${transcriptionSubscriptionCounter}`;
    closeCallbacks[closeCallbackName] = () => aiServiceSocket?.off(event, callback);

    return () => {
        unsubscribe();
        delete closeCallbacks[closeCallbackName];
    };
};

exports.aiServiceSocket = aiServiceSocket;
exports.closeSocket = closeSocket;
exports.emitEvent = emitEvent;
exports.emitEventWithAck = emitEventWithAck;
exports.subscribeEvent = subscribeEvent;

module.exports = exports;
