const Models = require('../../models/mysql');

exports.findAndCountAll = function (where, opts = {}, trx = null) {
    return Models.UserEssay.findAndCountAll({ where, ...opts, transaction: trx });
};

exports.findOne = function (where, opts = {}, trx = null) {
    return Models.UserEssay.findOne({ where, ...opts, transaction: trx });
};

exports.create = function (payload, trx = null) {
    return Models.UserEssay.create(payload, { transaction: trx });
};

exports.update = function (payload, where, trx = null) {
    return Models.UserEssay.update(payload, { where, transaction: trx });
};

exports.delete = function (where, trx = null) {
    return Models.UserEssay.destroy({ where, transaction: trx });
};

module.exports = exports;
