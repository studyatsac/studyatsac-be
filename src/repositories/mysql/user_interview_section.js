const Models = require('../../models/mysql');

exports.findOne = function (where, opts = {}, trx = null) {
    return Models.UserInterviewSection.findOne({ where, transaction: trx, ...opts });
};

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

exports.updateDuration = function (where, trx = null) {
    const query = `
UPDATE 
    user_interview_sections 
SET 
    duration = duration + TIMESTAMPDIFF(SECOND, resumed_at, CURRENT_TIMESTAMP) 
WHERE 
    user_id = :userId 
    AND uuid = :uuid 
    AND resumed_at IS NOT NULL 
    AND deleted_at IS NULL;
    `;

    const replacements = {
        ...where,
        userId: where.userId ?? 'NULL',
        uuid: where.uuid ?? 'NULL'
    };

    return Models.sequelize.query(query, {
        type: Models.sequelize.QueryTypes.UPDATE,
        replacements,
        transaction: trx
    });
};

exports.delete = function (where, opts = {}, trx = null) {
    return Models.UserInterviewSection.destroy({ where, transaction: trx, ...opts });
};

module.exports = exports;
