const Models = require('../../models/mysql');

exports.create = function (payload, trx = null) {
    return Models.EssayReviewLog.create(payload, { transaction: trx });
};

exports.createMany = function (payload, trx = null) {
    return Models.EssayReviewLog.bulkCreate(payload, { transaction: trx });
};

module.exports = exports;
