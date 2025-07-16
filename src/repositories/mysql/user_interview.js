const Models = require('../../models/mysql');

exports.findAll = function (where, opts = {}, trx = null) {
    return Models.UserInterview.findAll({ where, ...opts, transaction: trx });
};

exports.findOne = function (where, opts = {}, trx = null) {
    return Models.UserInterview.findOne({ where, ...opts, transaction: trx });
};

exports.create = function (payload, trx = null) {
    return Models.UserInterview.create(payload, { transaction: trx });
};

exports.update = function (payload, where, trx = null) {
    return Models.UserInterview.update(payload, { where, transaction: trx });
};

exports.delete = function (where, trx = null) {
    return Models.UserInterview.destroy({ where, transaction: trx });
};

module.exports = exports;
