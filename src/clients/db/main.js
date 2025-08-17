const sequelize = require('sequelize');
const LogUtils = require('../../utils/logger');

/**
 * @type {sequelize.Sequelize}
 */
let db;

const initializeDbClient = () => {
    const username = process.env.MYSQL_ROOT_USER;
    const password = process.env.MYSQL_ROOT_PASSWORD;
    const host = process.env.MYSQL_HOST;
    const database = process.env.MYSQL_DATABASE;
    const url = `mysql://${username}:${password}@${host}/${database}`;

    const config = {
        dialect: 'mysql2',
        dialectOptions: {
            decimalNumbers: true,
            maxPreparedStatements: 100
        },
        timezone: '+00:00', // utc
        logging: (process.env.DB_LOGGING === 'true' ? LogUtils.logDebug : false),
        operatorsAliases: 0,
        define: {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
            deletedAt: 'deleted_at'
        },
        pool: {
            max: (process.env.MYSQL_MAX_POOL ? parseInt(process.env.MYSQL_MAX_POOL) : 10),
            min: 1,
            acquire: 30000,
            idle: 10000
        }
    };

    db = new sequelize.Sequelize(url, config);
};

const getDbClient = () => {
    if (!db) throw new Error('DB client not initialized');
    return db;
};

exports.initializeDbClient = initializeDbClient;
exports.getDbClient = getDbClient;

module.exports = exports;
