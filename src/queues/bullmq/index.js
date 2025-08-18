const fs = require('fs');
const path = require('path');
const Redis = require('ioredis');

const queues = {};

const setupQueue = () => {
    const redisPath = process.env.REDIS_PATH;
    const host = process.env.REDIS_HOST;
    const port = process.env.REDIS_PORT;

    const basename = 'index.js';
    const dirname = `${__dirname}`;

    const config = redisPath ? { path: redisPath } : { host, port };
    const defaultJobOptions = {
        removeOnComplete: true,
        removeOnFail: { age: 3600 },
        attempts: 3,
        backoff: { type: 'fixed', delay: 3000 }
    };
    const redis = new Redis(config);

    fs.readdirSync(dirname)
        .filter((file) => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js'))
        .forEach((file) => {
            const queue = require(path.join(dirname, file))(redis, defaultJobOptions);

            let name = queue.name;
            const prefix = `${process.env.QUEUE_PREFIX}-`;
            if (name.startsWith(prefix)) name = name.replace(prefix, '');

            queues[name] = queue;
        });
};

module.exports = Object.assign(queues, {
    setupQueue
});
