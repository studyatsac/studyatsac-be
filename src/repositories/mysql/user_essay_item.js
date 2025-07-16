const Models = require('../../models/mysql');

exports.findAll = function (where, opts = {}, trx = null) {
    return Models.UserEssayItem.findAll({ where, ...opts, transaction: trx });
};

exports.findOne = function (where, opts = {}, trx = null) {
    return Models.UserEssayItem.findOne({ where, ...opts, transaction: trx });
};

exports.createMany = function (payload, trx = null) {
    return Models.UserEssayItem.bulkCreate(payload, { transaction: trx });
};

exports.createOrUpdate = function (payload, trx = null) {
    return Models.UserEssayItem.upsert(payload, { transaction: trx });
};

exports.update = function (payload, where, trx = null) {
    return Models.UserEssayItem.update(payload, { where, transaction: trx });
};

exports.delete = function (where, opts = {}, trx = null) {
    return Models.UserEssayItem.destroy({ where, transaction: trx, ...opts });
};

module.exports = exports;
