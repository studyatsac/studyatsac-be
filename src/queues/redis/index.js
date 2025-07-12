const fs = require('fs');
const path = require('path');
const Redis = require('ioredis');

const redisPath = process.env.REDIS_PATH;
const host = process.env.REDIS_HOST;
const port = process.env.REDIS_PORT;

const queue = {};
const basename = 'index.js';
const dirname = `${__dirname}`;

const config = path ? { path: redisPath } : { host, port };
const defaultJobOptions = {
    removeOnComplete: true,
    removeOnFail: { age: 3600 },
    attempts: 3,
    backoff: { type: 'fixed', delay: 3000 }
};

if ((redisPath || (host && port)) && Object.keys(queue).length === 0) {
    const redisQueue = new Redis(config);
    const redisWorker = new Redis({ ...config, maxRetriesPerRequest: null });

    const redis = { queue: redisQueue, worker: redisWorker };

    fs.readdirSync(dirname)
        .filter((file) => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js'))
        .forEach((file) => {
            const model = require(path.join(dirname, file))(redis, defaultJobOptions);
            queue[model.name] = model;
        });
}

module.exports = queue;
