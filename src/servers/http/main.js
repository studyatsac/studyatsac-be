const express = require('express');
const cors = require('cors');
const http = require('http');
const LogUtils = require('../../utils/logger');

/**
 * @type {express.Express}
 */
let app;
/**
 * @type {http.Server}
 */
let server;

const initializeServer = () => {
    app = express();

    app.set('trust proxy', 1);

    app.use(cors({
        origin: '*',
        methods: 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
        allowedHeaders: ['Content-Type', 'Accept-Language', 'Authorization', 'Accept', 'admin-api-key', 'x-requested-with'],
        AccessControlAllowOrigin: '*',
        credentials: true,
        optionsSuccessStatus: 200
    }));
    app.use(express.json({ limit: '5mb' }));
    app.use(express.urlencoded({ extended: false }));

    server = http.createServer(app);
};

const getApp = () => {
    if (!app) throw new Error('App not initialized');
    return app;
};

const getServer = () => {
    if (!server) throw new Error('Server not initialized');
    return server;
};

const addAppMiddleware = (middleware) => {
    getApp().use(middleware);
};

const addAppRoute = (route, handler) => {
    getApp().use(route, handler);
};

const startServer = (host, port) => {
    const targetHost = host ?? process.env.APP_URL;
    const targetPort = port ?? process.env.APP_PORT;
    getServer().listen(targetPort, targetHost, () => {
        LogUtils.logDebug(`app running on ${targetHost}:${targetPort}`);
    });
};

exports.initializeServer = initializeServer;
exports.getApp = getApp;
exports.getServer = getServer;
exports.addAppMiddleware = addAppMiddleware;
exports.addAppRoute = addAppRoute;
exports.startServer = startServer;

module.exports = exports;
