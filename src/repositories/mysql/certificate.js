const Models = require('../../models/mysql');

exports.create = function (payload, trx = null) {
    return Models.Certificate.create(payload, { transaction: trx });
};
