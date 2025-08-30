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

/**
 * 5 seconds
 */
const DEFAULT_ACK_TIMEOUT = 5 * 1000;

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

const closeAiServiceSocket = () => {
    Object.values(closeCallbacks).forEach((callback) => {
        if (typeof callback !== 'function') return;
        try {
            callback();
        } catch (err) {
            LogUtils.logError({ functionName: 'closeAiServiceSocket', message: err.message });
        }
    });
};

const isAiServiceSocketConnected = () => Boolean(aiServiceSocket && aiServiceSocket.connected);

const emitAiServiceEventWithAckTimeout = (event, ...args) => {
    let options = {};
    // eslint-disable-next-line no-underscore-dangle -- Fine to use dangling
    if (args.length && typeof args[args.length - 1] === 'object' && args[args.length - 1]?.__emitWithAckOpts) {
        // eslint-disable-next-line no-underscore-dangle -- Fine to use dangling
        options = args.pop().__emitWithAckOpts;
    }

    const timeoutMs = (options.timeoutMs && Number(options.timeoutMs) > 0) ? Number(options.timeoutMs) : DEFAULT_ACK_TIMEOUT;
    const serviceSocket = getAiServiceSocket();

    return new Promise((resolve, reject) => {
        try {
            serviceSocket.timeout(timeoutMs).emit(event, ...args, (err, response) => {
                if (err) return reject(err);
                return resolve(response);
            });

            return undefined;
        } catch (err) {
            return reject(err);
        }
    });
};

const emitAiServiceEventWithAckBooleanTimeout = async (event, ...args) => {
    try {
        return !!(await emitAiServiceEventWithAckTimeout(event, ...args));
    } catch {
        return false;
    }
};

const pingAiServiceSocket = async (event = 'ping', timeoutMs = DEFAULT_ACK_TIMEOUT) => {
    if (!isAiServiceSocketConnected()) return false;
    try {
        return !!(await emitAiServiceEventWithAckTimeout(event, {}, { __emitWithAckOpts: { timeoutMs } }));
    } catch (err) {
        LogUtils.logDebug({ functionName: 'pingAiServiceSocket', message: err.message });
        return false;
    }
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
exports.closeAiServiceSocket = closeAiServiceSocket;
exports.emitAiServiceEvent = emitAiServiceEvent;
exports.emitAiServiceEventWithAck = emitAiServiceEventWithAck;
exports.emitAiServiceEventWithAckTimeout = emitAiServiceEventWithAckTimeout;
exports.emitAiServiceEventWithAckBooleanTimeout = emitAiServiceEventWithAckBooleanTimeout;
exports.isAiServiceSocketConnected = isAiServiceSocketConnected;
exports.pingAiServiceSocket = pingAiServiceSocket;
exports.subscribeAiServiceEvent = subscribeAiServiceEvent;

module.exports = exports;
