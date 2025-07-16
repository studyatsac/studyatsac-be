const Models = require('../../models/mysql');

exports.create = function (payload, trx = null) {
    return Models.InterviewSection.create(payload, { transaction: trx });
};

exports.createMany = function (payload, trx = null) {
    return Models.InterviewSection.bulkCreate(payload, { transaction: trx });
};

exports.createOrUpdate = function (payload, trx = null) {
    return Models.InterviewSection.upsert(payload, { transaction: trx });
};

exports.delete = function (where, opts = {}, trx = null) {
    return Models.InterviewSection.destroy({ where, transaction: trx, ...opts });
};

module.exports = exports;
