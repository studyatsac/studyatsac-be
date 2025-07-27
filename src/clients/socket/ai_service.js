const socket = require('socket.io-client');
const LogUtils = require('../../utils/logger');

/**
 * @type {socket.Socket}
 */
let aiServiceSocket;
/**
 * @type {Record<string, Function>}
 */
const closeCallbacks = {};

const initializeAiServiceSocket = () => {
    aiServiceSocket = socket.connect(
        process.env.AI_SERVICE_SOCKET_URL,
        { auth: { key: process.env.AI_SERVICE_SOCKET_KEY } }
    );

    aiServiceSocket.on('connect', () => {
        LogUtils.logDebug('ai service socket connected');
        closeCallbacks.disconnect = () => aiServiceSocket.disconnect();
    });
    aiServiceSocket.on('connect_error', (reason) => {
        LogUtils.logError('ai service socket connection error', reason?.message ?? reason);
        delete closeCallbacks.disconnect;
    });
    aiServiceSocket.on('disconnect', (reason) => {
        LogUtils.logDebug('ai service socket disconnected', reason?.message ?? reason);
        delete closeCallbacks.disconnect;
    });
};

const getAiServiceSocket = () => {
    if (!aiServiceSocket) throw new Error('AI service socket not initialized');
    return aiServiceSocket;
};

const closeAiServiceSocketSocket = () => {
    Object.values(closeCallbacks).forEach((callback) => {
        if (typeof callback !== 'function') return;
        callback?.();
    });
};

const emitAiServiceEvent = (event, ...params) => {
    getAiServiceSocket().emit(event, ...params);
};

const emitAiServiceEventWithAck = async (event, ...params) => getAiServiceSocket().emitWithAck(event, ...params);

let transcriptionSubscriptionCounter = 0;
const subscribeAiServiceEvent = (event, callback) => {
    getAiServiceSocket().on(event, callback);

    const unsubscribe = () => getAiServiceSocket().off(event, callback);

    transcriptionSubscriptionCounter += 1;
    const closeCallbackName = `${event}${transcriptionSubscriptionCounter}`;
    closeCallbacks[closeCallbackName] = () => getAiServiceSocket().off(event, callback);

    return () => {
        unsubscribe();
        delete closeCallbacks[closeCallbackName];
    };
};

exports.initializeAiServiceSocket = initializeAiServiceSocket;
exports.getAiServiceSocket = getAiServiceSocket;
exports.closeAiServiceSocketSocket = closeAiServiceSocketSocket;
exports.emitAiServiceEvent = emitAiServiceEvent;
exports.emitAiServiceEventWithAck = emitAiServiceEventWithAck;
exports.subscribeAiServiceEvent = subscribeAiServiceEvent;

module.exports = exports;
