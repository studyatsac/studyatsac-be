const Models = require('../../models/mysql');

exports.findAndCountAll = function (where, opts = {}, trx = null) {
    return Models.MasterCategory.findAndCountAll({ where, ...opts, transaction: trx });
};

exports.findOne = function (where, opts = {}, trx = null) {
    return Models.MasterCategory.findOne({ where, ...opts, transaction: trx });
};

exports.create = function (payload, trx = null) {
    return Models.MasterCategory.create(payload, { transaction: trx });
};

exports.update = function (where, payload, trx = null) {
    return Models.MasterCategory.update(payload, { where, transaction: trx });
};

exports.delete = function (where, trx = null) {
    return Models.MasterCategory.destroy({ where, transaction: trx });
};
module.exports = exports;
