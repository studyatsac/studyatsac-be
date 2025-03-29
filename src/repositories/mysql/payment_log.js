const Models = require('../../models/mysql');

exports.create = function (payload, trx = null) {
    return Models.PaymentLog.create(payload, { transaction: trx });
};

module.exports = exports;
