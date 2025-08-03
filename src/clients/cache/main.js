const redis = require('ioredis');

/**
 * @type {redis.Redis}
 */
let redisClient;

const initializeCacheClient = () => {
    const redisPath = process.env.REDIS_PATH;
    const host = process.env.REDIS_HOST;
    const port = process.env.REDIS_PORT;

    redisClient = new redis.Redis(redisPath ? { path: redisPath } : { host, port });
};

const getCacheClient = () => {
    if (!redisClient) throw new Error('Cache client not initialized');
    return redisClient;
};

const setCache = async (key, value, ttl) => {
    if (ttl == null) return getCacheClient().set(key, value);
    return getCacheClient().set(key, value, 'PX', ttl);
};

const getCache = async (key) => getCacheClient().get(key);

const deleteCache = async (key) => getCacheClient().del(key);

exports.initializeCacheClient = initializeCacheClient;
exports.getCacheClient = getCacheClient;
exports.setCache = setCache;
exports.getCache = getCache;
exports.deleteCache = deleteCache;

module.exports = exports;
