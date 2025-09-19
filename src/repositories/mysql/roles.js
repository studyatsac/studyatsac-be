const Models = require('../../models/mysql');

exports.findAll = function (opts = {}, trx = null) {
    return Models.Role.findAll({ ...opts, transaction: trx });
};

exports.findAndCountAll = function (where, opts = {}, trx = null) {
    return Models.Role.findAndCountAll({ where, ...opts, transaction: trx });
};

exports.findOne = function (where, opts = {},trx = null) {
    return Models.Role.findOne({ where, ...opts, transaction: trx });
};

exports.create = function (data, opts = {}, trx = null) {
    return Models.Role.create(data, { ...opts, transaction: trx });
};

exports.update = function (payload, where, trx = null) {
    return Models.Role.update(payload, {where, transaction: trx });
};

exports.delete = function (where, trx = null) {
    return Models.Role.destroy({ where, transaction: trx });
};

module.exports = exports;
