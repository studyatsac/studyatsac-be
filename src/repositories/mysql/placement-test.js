const Models = require('../../models/mysql');

exports.findOne = function (where, opts = {}, trx = null) {
    return Models.PlacementTest.findOne({ where, ...opts, transaction: trx });
};

exports.findAndCountAll = function (where, opts = {}, trx = null) {
    return Models.PlacementTest.findAndCountAll({ where, ...opts, transaction: trx });
};

exports.create = function (payload, trx = null) {
    return Models.PlacementTest.create(payload, { transaction: trx });
};

exports.update = function (where, payload, trx = null) {
    return Models.PlacementTest.update(payload, { where, transaction: trx });
};

exports.delete = function (where, trx = null) {
    return Models.PlacementTest.destroy({ where, transaction: trx });
};

module.exports = exports;
