const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');

const username = process.env.MYSQL_ROOT_USER;
const password = process.env.MYSQL_ROOT_PASSWORD;
const host = process.env.MYSQL_HOST;
const database = process.env.MYSQL_DATABASE;
const url = `mysql://${username}:${password}@${host}/${database}`;

const db = {};
const basename = 'index.js';
const dirname = `${__dirname}`;

const config = {
    dialect: 'mysql2',
    dialectOptions: {
        decimalNumbers: true,
        maxPreparedStatements: 100
    },
    timezone: '+00:00', // utc
    logging: (process.env.DB_LOGGING === 'true' ? console.log : false),
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

if (host && url && Object.keys(db).length === 0) {
    const sequelize = new Sequelize(url, config);

    fs.readdirSync(dirname)
        .filter((file) => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js'))
        .forEach((file) => {
            const model = require(path.join(dirname, file))(sequelize, Sequelize.DataTypes);
            db[model.name] = model;
        });

    Object.keys(db).forEach((modelName) => {
        if (db[modelName].associate) {
            db[modelName].associate(db);
        }
    });

    db.sequelize = sequelize;
    db.Sequelize = Sequelize;
    db.Op = Sequelize.Op;
}

module.exports = db;
