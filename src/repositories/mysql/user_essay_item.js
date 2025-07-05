const Models = require('../../models/mysql');

exports.createMany = function (payload, trx = null) {
    return Models.UserEssayItem.bulkCreate(payload, { transaction: trx });
};

exports.creatOrUpdate = function (payload, trx = null) {
    return Models.UserEssayItem.upsert(payload, { transaction: trx });
};

exports.delete = function (where, trx = null, force) {
    return Models.UserEssayItem.destroy({ where, force, transaction: trx });
};

module.exports = exports;
