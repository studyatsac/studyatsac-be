const Moment = require('moment');

const Models = require('../../models/mysql');

exports.findAllExcludeExpired = function (where, opts = {}, trx = null) {
    where.expiredAt = {
        [Models.Sequelize.Op.gte]: Moment.utc().format()
    };

    return Models.UserPurchase.findAll({ where, ...opts, transaction: trx });
};

exports.findWithCategoryAndCountAlll = async function (where, opts = {}, trx = null) {
    const query = `
    SELECT
        ep.id id,
        ep.uuid uuid,
        ep.title title,
        mc.id category_id,
        mc.uuid category_uuid,
        mc.title category_title
    FROM user_purchases up
    JOIN exam_packages ep ON up.exam_package_id = ep.id AND ep.deleted_at IS NULL
    JOIN exam_package_categories epc ON ep.id = epc.exam_package_id AND epc.deleted_at IS NULL
    JOIN master_categories mc ON epc.master_category_id = mc.id AND mc.deleted_at IS NULL
    WHERE up.user_id = :userId
    AND up.expired_at > :expiredAt
    AND up.deleted_at IS NULL
    ORDER BY up.created_at DESC
    LIMIT :limit
    `;

    const replacements = {
        userId: where.userId,
        expiredAt: Moment.utc().format(),
        limit: opts.limit
    };

    const rows = await Models.sequelize.query(query, {
        type: Models.sequelize.QueryTypes.SELECT,
        replacements
    });

    const count = await Models.UserPurchase.count({
        userId: where.userId,
        expiredAt: Moment.utc().format()
    });

    return { rows, count };
};

exports.findOneExcludeExpired = function (where, opts = {}, trx = null) {
    where.expiredAt = {
        [Models.Sequelize.Op.gte]: Moment.utc().format()
    };

    return Models.UserPurchase.findOne({ where, ...opts, transaction: trx });
};

exports.create = function (payload, trx = null) {
    return Models.UserPurchase.create(payload, { transaction: trx });
};

exports.update = function (payload, where, trx = null) {
    return Models.UserPurchase.update(payload, { where, transaction: trx });
};

exports.findOne = function (where, opts = {}, trx = null) {
    return Models.UserPurchase.findOne({ where, ...opts, transaction: trx });
};

exports.delete = function (where, trx = null) {
    return Models.UserPurchase.destroy({ where, transaction: trx });
};

exports.countByExamPackageId = function (examPackageId, trx = null) {
    return Models.UserPurchase.count({ where: { exam_package_id: examPackageId }, transaction: trx });
};

module.exports = exports;
