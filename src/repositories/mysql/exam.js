const Models = require('../../models/mysql');

exports.findAndCountAll = function (where, opts = {}, trx = null) {
    return Models.Exam.findAndCountAll({ where, ...opts, transaction: trx });
};

exports.findOne = function (where, opts = {}, trx = null) {
    return Models.Exam.findOne({ where, ...opts, transaction: trx });
};

exports.create = function (payload, trx = null) {
    return Models.Exam.create(payload, { transaction: trx });
};

exports.update = function (payload, where, trx = null) {
    return Models.Exam.update(payload, { where, transaction: trx });
};

exports.delete = function (where, trx = null) {
    return Models.Exam.destroy({ where, transaction: trx });
};

module.exports = exports;
