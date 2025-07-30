const Models = require('../../models/mysql');

exports.create = function (payload, trx = null) {
    return Models.UserInterviewSection.create(payload, { transaction: trx });
};

exports.createMany = function (payload, trx = null) {
    return Models.UserInterviewSection.bulkCreate(payload, { transaction: trx });
};

exports.createOrUpdate = function (payload, trx = null) {
    return Models.UserInterviewSection.upsert(payload, { transaction: trx });
};

exports.update = function (payload, where, trx = null) {
    return Models.UserInterviewSection.update(payload, { where, transaction: trx });
};

exports.delete = function (where, opts = {}, trx = null) {
    return Models.UserInterviewSection.destroy({ where, transaction: trx, ...opts });
};

module.exports = exports;
