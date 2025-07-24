const fs = require('fs');
const path = require('path');
const Redis = require('ioredis');

const redisPath = process.env.REDIS_PATH;
const host = process.env.REDIS_HOST;
const port = process.env.REDIS_PORT;

const worker = {};
const basename = 'index.js';
const dirname = `${__dirname}`;

const config = redisPath ? { path: redisPath } : { host, port };

if ((redisPath || (host && port)) && Object.keys(worker).length === 0) {
    const redis = new Redis({ ...config, maxRetriesPerRequest: null });

    fs.readdirSync(dirname)
        .filter((file) => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js'))
        .forEach((file) => {
            const model = require(path.join(dirname, file))(redis);

            let name = model.name;
            const prefix = `${process.env.QUEUE_PREFIX}-`;
            if (name.startsWith(prefix)) name = name.replace(prefix, '');

            worker[name] = model;
        });
}

module.exports = worker;
