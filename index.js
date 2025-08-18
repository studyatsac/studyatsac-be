// Setup configuration
require('dotenv').config();

const express = require('express');
const Server = require('./src/servers/http/main');
const SocketServer = require('./src/servers/socket/main');

// Init servers
Server.initializeServer();
SocketServer.initializeSocketServer(Server.getServer());

const DbClient = require('./src/clients/db/main');
const CacheClient = require('./src/clients/cache/main');
const OpenAiClient = require('./src/clients/http/open_ai');
// const AiServiceSocketClient = require('./src/clients/socket/ai_service');

// Init clients
DbClient.initializeDbClient();
CacheClient.initializeCacheClient();
OpenAiClient.initializeOpenAiClient();
// AiServiceSocketClient.initializeAiServiceSocket();

// Setup models
const Models = require('./src/models/mysql');

Models.setupModel();

// Setup queues
const Queues = require('./src/queues/bullmq');

Queues.setupQueue();

// Setup app
const routerV1 = require('./src/routes/v1');

Server.addAppMiddleware(express.static('./storage'));
Server.addAppRoute('/v1', routerV1);

// Setup socket
const eventV1 = require('./src/events/v1');
const socketConnectionMiddleware = require('./src/middlewares/socket_connection_middleware');

SocketServer.addSocketMiddleware(socketConnectionMiddleware);
SocketServer.addSocketEvent(eventV1);

// Setup subscriptions
// const Subscriptions = require('./src/subscriptions/socket-io');

// Subscriptions.setupSubscription();

// Setup workers
const Workers = require('./src/workers/bullmq');

Workers.setupWorker();

// Start the sever
Server.startServer();
