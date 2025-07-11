const Models = require('../../models/mysql');

exports.create = function (payload, trx = null) {
    return Models.PaymentLog.create(payload, { transaction: trx });
};

exports.createMany = function (payload, trx = null) {
    return Models.PaymentLog.bulkCreate(payload, { transaction: trx });
};

module.exports = exports;
