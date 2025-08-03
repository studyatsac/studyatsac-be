const Models = require('../../models/mysql');

exports.create = function (payload, trx = null) {
    return Models.InterviewReviewLog.create(payload, { transaction: trx });
};

exports.createMany = function (payload, trx = null) {
    return Models.InterviewReviewLog.bulkCreate(payload, { transaction: trx });
};

module.exports = exports;
