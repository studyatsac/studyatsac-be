const Models = require('../../models/mysql');

exports.findOne = function (where, opts = {}, trx = null) {
    return Models.IeltsScore.findOne({ where, ...opts, transaction: trx });
};

exports.findAndCountAll = function (where, opts = {}, trx = null) {
    return Models.IeltsScore.findAndCountAll({ where, ...opts, transaction: trx });
};

exports.create = function (payload, trx = null) {
    return Models.IeltsScore.create(payload, { transaction: trx });
};

module.exports = exports;
