const Models = require('../../models/mysql');

exports.findAll = function (where, opts = {}, trx = null) {
    return Models.EssayItem.findAll({ where, ...opts, transaction: trx });
};

exports.findOne = function (where, opts = {}, trx = null) {
    return Models.EssayItem.findOne({ where, ...opts, transaction: trx });
};

exports.create = function (payload, trx = null) {
    return Models.EssayItem.create(payload, { transaction: trx });
};

exports.createMany = function (payload, trx = null) {
    return Models.EssayItem.bulkCreate(payload, { transaction: trx });
};

exports.update = function (payload, where, trx = null) {
    return Models.EssayItem.update(payload, { where, transaction: trx });
};

exports.delete = function (where, trx = null) {
    return Models.EssayItem.destroy({ where, transaction: trx });
};

module.exports = exports;
