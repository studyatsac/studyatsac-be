const redis = require('ioredis');

const redisPath = process.env.REDIS_PATH;
const host = process.env.REDIS_HOST;
const port = process.env.REDIS_PORT;

let redisClient;
if ((redisPath || (host && port)) && !redisClient) {
    redisClient = new redis.Redis(redisPath ? { path: redisPath } : { host, port });
}

module.exports = redisClient;
