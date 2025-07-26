const fs = require('fs');
const path = require('path');
const ioredis = require('ioredis');

const workers = {};

const setupWorker = () => {
    const redisPath = process.env.REDIS_PATH;
    const host = process.env.REDIS_HOST;
    const port = process.env.REDIS_PORT;

    const basename = 'index.js';
    const dirname = `${__dirname}`;

    const config = redisPath ? { path: redisPath } : { host, port };
    const redis = new ioredis.Redis({ ...config, maxRetriesPerRequest: null });

    fs.readdirSync(dirname)
        .filter((file) => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js'))
        .forEach((file) => {
            const worker = require(path.join(dirname, file))(redis);

            let name = worker.name;
            const prefix = `${process.env.QUEUE_PREFIX}-`;
            if (name.startsWith(prefix)) name = name.replace(prefix, '');

            workers[name] = worker;
        });
};

module.exports = Object.assign(workers, {
    setupWorker
});
