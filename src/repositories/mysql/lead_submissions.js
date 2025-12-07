const Models = require('../../models/mysql');

exports.findOne = function (where, opts = {}, trx = null) {
    return Models.LeadSubmissions.findOne({ where, ...opts, transaction: trx });
};

exports.create = function (payload, trx = null) {
    return Models.LeadSubmissions.create(payload, { transaction: trx });
};

exports.update = function (where, payload, trx = null) {
    return Models.LeadSubmissions.update(payload, { where, transaction: trx });
};

exports.findAll = function (where, opts = {}, trx = null) {
    return Models.LeadSubmissions.findAll({ where, ...opts, transaction: trx });
};

exports.findAndCountAll = function (where = {}, opts = {}, trx = null) {
    return Models.LeadSubmissions.findAndCountAll({ where, ...opts, transaction: trx });
};

exports.countAll = function (where = {}, trx = null) {
    return Models.LeadSubmissions.count({ where, transaction: trx });
};

exports.delete = function (where, trx = null) {
    return Models.LeadSubmissions.destroy({ where, transaction: trx });
};

module.exports = exports;
