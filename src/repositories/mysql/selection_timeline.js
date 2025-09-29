const Models = require('../../models/mysql');

exports.findAll = function (where, opts = {}, trx = null) {
    return Models.SelectionTimeline.findAll({ where, ...opts, transaction: trx });
};

exports.findAndCountAll = function (where, opts = {}, trx = null) {
    return Models.SelectionTimeline.findAndCountAll({ where, ...opts, transaction: trx });
};

exports.findOne = function (where, opts = {}, trx = null) {
    return Models.SelectionTimeline.findOne({ where, ...opts, transaction: trx });
};

exports.create = function (data, opts = {}, trx = null) {
    return Models.SelectionTimeline.create(data, { transaction: trx });
};

exports.update = function (payload, where, trx = null) {
    return Models.SelectionTimeline.update(payload, { where, transaction: trx });
};

exports.delete = function (where, opts = {}, trx = null) {
    return Models.SelectionTimeline.destroy({ where, ...opts, transaction: trx });
};

module.exports = exports;
