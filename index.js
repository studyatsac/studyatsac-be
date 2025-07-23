/* eslint-disable no-console */
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
const socketConnectionMiddleware = require('./src/middlewares/socket_connection_middleware');

const app = express();
const server = http.createServer(app);
const io = new socket.Server(server, { cors: { origin: '*' } });

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

io.use(socketConnectionMiddleware);
io.on('connection', (client) => {
    console.log('user connected', client?.id);
    client.on('disconnect', () => {
        console.log('user disconnected', client?.id);
        console.log((new Date()));
    });
});

const host = process.env.APP_URL;
const port = process.env.APP_PORT;
server.listen(port, () => {
    console.log(`app running on ${host}:${port}`);
    console.log((new Date()));
});
