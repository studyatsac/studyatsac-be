const Models = require('../../models/mysql');

exports.findAll = function (where, opts = {}, trx = null) {
    return Models.EssayPackage.findAll({ where, ...opts, transaction: trx });
};

exports.findAndCountAll = function (where, opts = {}, trx = null) {
    return Models.EssayPackage.findAndCountAll({ where, ...opts, transaction: trx });
};

exports.findOne = function (where, opts = {}, trx = null) {
    return Models.EssayPackage.findOne({ where, ...opts, transaction: trx });
};

exports.create = function (payload, trx = null) {
    return Models.EssayPackage.create(payload, { transaction: trx });
};

exports.update = function (payload, where, trx = null) {
    return Models.EssayPackage.update(payload, { where, transaction: trx });
};

exports.delete = function (where, trx = null) {
    return Models.EssayPackage.destroy({ where, transaction: trx });
};

module.exports = exports;
