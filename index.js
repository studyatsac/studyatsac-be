/**
    this code was written hastily and carelessly
    there is no design beforehand carefully, because it is done with a short free time
    :'(
 */
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const http = require('http');
const socket = require('socket.io');
const routerV1 = require('./src/routes/v1');
const eventV1 = require('./src/events/v1');
const socketConnectionMiddleware = require('./src/middlewares/socket_connection_middleware');
const LogUtils = require('./src/utils/logger');

// Init clients
require('./src/clients/socket/ai_service');
require('./src/clients/http/open_ai');

// Init queue workers
require('./src/workers/bullmq');

// Init socket subscriptions
require('./src/subscriptions/socket-io');

const app = express();

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
app.use(express.static('./storage'));
app.use('/v1', routerV1);

const server = http.createServer(app);
const io = new socket.Server(server, { cors: { origin: '*' } });

io.use(socketConnectionMiddleware);
io.on('connection', (client) => {
    LogUtils.logDebug('socket user connected', client?.handshake?.auth?.user?.email);
    eventV1.forEach(({ event, callback }) => {
        client.on(event, (...params) => callback(client, ...params));
    });
    client.on('disconnect', () => {
        LogUtils.logDebug('socket user disconnected', client?.handshake?.auth?.user?.email);
    });
});

const host = process.env.APP_URL;
const port = process.env.APP_PORT;
server.listen(port, () => {
    LogUtils.logDebug(`app running on ${host}:${port}`);
});
