const Models = require('../../models/mysql');

exports.createMany = function (payload, trx = null) {
    return Models.EssayItem.bulkCreate(payload, { transaction: trx });
};

exports.creatOrUpdate = function (payload, trx = null) {
    return Models.EssayItem.upsert(payload, { transaction: trx });
};

exports.delete = function (where, trx = null) {
    return Models.EssayItem.destroy({ where, transaction: trx });
};

module.exports = exports;
