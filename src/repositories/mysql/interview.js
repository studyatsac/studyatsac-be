const Models = require('../../models/mysql');

exports.findAll = function (where, opts = {}, trx = null) {
    return Models.Interview.findAll({ where, ...opts, transaction: trx });
};

exports.findOne = function (where, opts = {}, trx = null) {
    return Models.Interview.findOne({ where, ...opts, transaction: trx });
};

exports.create = function (payload, trx = null) {
    return Models.Interview.create(payload, { transaction: trx });
};

exports.update = function (payload, where, trx = null) {
    return Models.Interview.update(payload, { where, transaction: trx });
};

exports.delete = function (where, trx = null) {
    return Models.Interview.destroy({ where, transaction: trx });
};

module.exports = exports;
