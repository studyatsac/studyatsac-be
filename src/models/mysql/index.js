const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const DbClient = require('../../clients/db/main');

/**
 * @type {{ sequelize: Sequelize.Sequelize, Sequelize: Sequelize, Op: Sequelize.Op }}
 */
const models = {};

const setupModel = () => {
    const basename = 'index.js';
    const dirname = `${__dirname}`;
    const sequelize = DbClient.getDbClient();

    fs.readdirSync(dirname)
        .filter((file) => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js'))
        .forEach((file) => {
            const model = require(path.join(dirname, file))(sequelize, Sequelize.DataTypes);
            models[model.name] = model;
        });

    Object.keys(models).forEach((modelName) => {
        if (models[modelName].associate) {
            models[modelName].associate(models);
        }
    });

    models.sequelize = sequelize;
    models.Sequelize = Sequelize;
    models.Op = Sequelize.Op;
};

module.exports = Object.assign(models, {
    setupModel
});
