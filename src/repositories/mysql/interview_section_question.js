const Models = require('../../models/mysql');

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
