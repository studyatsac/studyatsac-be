const Models = require('../../models/mysql');

exports.findAndCountAll = function (where, opts = {}, trx = null) {
    return Models.MasterCategory.findAndCountAll({ where, ...opts, transaction: trx });
};

exports.findOne = function (where, opts = {}, trx = null) {
    return Models.MasterCategory.findOne({ where, ...opts, transaction: trx });
};

module.exports = exports;
