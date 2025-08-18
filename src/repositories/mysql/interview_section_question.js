const Models = require('../../models/mysql');

exports.findOne = function (where, opts = {}, trx = null) {
    return Models.InterviewSectionQuestion.findOne({ where, ...opts, transaction: trx });
};

exports.countAll = function (where, opts = {}, trx = null) {
    return Models.InterviewSectionQuestion.count({ where, ...opts, transaction: trx });
};

exports.createMany = function (payload, trx = null) {
    return Models.InterviewSectionQuestion.bulkCreate(payload, { transaction: trx });
};

exports.createOrUpdate = function (payload, trx = null) {
    return Models.InterviewSectionQuestion.upsert(payload, { transaction: trx });
};

exports.delete = function (where, opts = {}, trx = null) {
    return Models.InterviewSectionQuestion.destroy({ where, transaction: trx, ...opts });
};

module.exports = exports;
