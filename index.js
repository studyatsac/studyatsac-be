/**
    this code was written hastily and carelessly
    there is no design beforehand carefully, because it is done with a short free time
    :'(
 */
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const routerV1 = require('./src/routes/v1');

const app = express();
const host = process.env.APP_URL;
const port = process.env.APP_PORT;

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

// eslint-disable-next-line no-console
app.listen(port, () => {
    console.log(`app running on ${host}:${port}`);
    console.log((new Date()));
});
