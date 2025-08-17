const socket = require('socket.io');
const LogUtils = require('../../utils/logger');

/**
 * @type {socket.Server}
 */
let socketServer;
/**
 * @type {Array<{ event: string, callback: Function }>}
 */
const events = [];

/**
 *
 * @param {http.Server} server
 */
const initializeSocketServer = (server) => {
    socketServer = new socket.Server(server, { cors: { origin: '*' } });
    socketServer.on('connection', (client) => {
        LogUtils.logDebug('socket user connected', client?.handshake?.auth?.user?.email);
        events.forEach(({ event, callback }) => {
            client.on(event, (...params) => callback(client, ...params));
        });
        client.on('disconnect', () => {
            LogUtils.logDebug('socket user disconnected', client?.handshake?.auth?.user?.email);
        });
    });
};

const getSocketServer = () => {
    if (!socketServer) throw new Error('Socket server not initialized');
    return socketServer;
};

const addSocketMiddleware = (middleware) => {
    getSocketServer().use(middleware);
};

const addSocketEvent = (targetEvents) => {
    if (!Array.isArray(targetEvents) || !targetEvents.length) return;
    events.push(...targetEvents);
};

const emitEventToClient = (clientSid, event, ...params) => getSocketServer().to(clientSid)?.emit(event, ...params);

exports.initializeSocketServer = initializeSocketServer;
exports.getSocketServer = getSocketServer;
exports.addSocketMiddleware = addSocketMiddleware;
exports.addSocketEvent = addSocketEvent;
exports.emitEventToClient = emitEventToClient;

module.exports = exports;
