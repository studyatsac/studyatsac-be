const Models = require('../../models/mysql');

exports.bulkCreate = function (payloads, trx = null) {
    return Models.IeltsWritingSubmission.bulkCreate(payloads, { transaction: trx });
};

exports.findOne = function (where, opts = {}, trx = null) {
    return Models.IeltsWritingSubmission.findOne({ where, ...opts, transaction: trx });
};

exports.create = function (payload, trx = null) {
    return Models.IeltsWritingSubmission.create(payload, { transaction: trx });
};

exports.update = function (where, payload, trx = null) {
    return Models.IeltsWritingSubmission.update(payload, { where, transaction: trx });
};

exports.delete = function (where, trx = null) {
    return Models.IeltsWritingSubmission.destroy({ where, transaction: trx });
};

exports.findAndCountAll = function (where, opts = {}, trx = null) {
    return Models.IeltsWritingSubmission.findAndCountAll({ where, ...opts, transaction: trx });
};

module.exports = exports;
