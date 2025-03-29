const Models = require('../../models/mysql');

exports.bulkCreate = function (payloads, trx = null) {
    return Models.IeltsWritingSubmission.bulkCreate(payloads, { transaction: trx });
};

exports.findAndCountAll = function (where, opts = {}, trx = null) {
    return Models.IeltsWritingSubmission.findAndCountAll({ where, ...opts, transaction: trx });
};

module.exports = exports;
