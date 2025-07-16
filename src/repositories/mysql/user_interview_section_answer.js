const Models = require('../../models/mysql');

exports.createMany = function (payload, trx = null) {
    return Models.UserInterviewSectionAnswer.bulkCreate(payload, { transaction: trx });
};

exports.createOrUpdate = function (payload, trx = null) {
    return Models.UserInterviewSectionAnswer.upsert(payload, { transaction: trx });
};

exports.delete = function (where, opts = {}, trx = null) {
    return Models.UserInterviewSectionAnswer.destroy({ where, transaction: trx, ...opts });
};

module.exports = exports;
