const Models = require('../../models/mysql');

exports.findAll = function (where, opts = {}, trx = null) {
    return Models.EssayPackage.findAll({ where, ...opts, transaction: trx });
};

exports.findAndCountAll = function (where, opts = {}, trx = null) {
    return Models.EssayPackage.findAndCountAll({ where, ...opts, transaction: trx });
};

exports.findOne = function (where, opts = {}, trx = null) {
    return Models.EssayPackage.findOne({ where, ...opts, transaction: trx });
};

exports.create = function (payload, trx = null) {
    return Models.EssayPackage.create(payload, { transaction: trx });
};

exports.update = function (payload, where, trx = null) {
    return Models.EssayPackage.update(payload, { where, transaction: trx });
};

exports.delete = function (where, trx = null) {
    return Models.EssayPackage.destroy({ where, transaction: trx });
};

exports.findFromUserPurchaseAndCountAll = async function (where, opts = {}, trx = null) {
    const baseQuery = `
SELECT DISTINCT 
    EssayPackage.uuid, 
    EssayPackage.title, 
    EssayPackage.description, 
    EssayPackage.additional_information AS additionalInformation, 
    EssayPackage.price, 
    EssayPackage.total_max_attempt AS totalMaxAttempt, 
    EssayPackage.default_item_max_attempt AS defaultItemMaxAttempt, 
    EssayPackage.payment_url AS paymentUrl, 
    EssayPackage.is_active AS isActive, 
    EssayPackage.created_at
FROM 
    essay_packages AS EssayPackage 
    JOIN user_purchases AS UserPurchase ON UserPurchase.essay_package_id = EssayPackage.id  
WHERE 
    ( 
        EssayPackage.deleted_at IS NULL 
        AND EssayPackage.is_active = :isActive
        AND UserPurchase.deleted_at IS NULL 
        AND UserPurchase.user_id = :userId 
    ) 
    `;

    const replacements = {
        ...where,
        userId: where.userId ?? 'IS NOT NULL',
        isActive: where.isActive ?? true,
        limit: opts.limit,
        offset: opts.offset
    };

    const query = `${baseQuery} ORDER BY EssayPackage.created_at DESC LIMIT :limit OFFSET :offset;`;
    const rows = await Models.sequelize.query(query, {
        type: Models.sequelize.QueryTypes.SELECT,
        replacements,
        model: Models.EssayPackage,
        mapToModel: true,
        transaction: trx
    });

    const countQuery = `SELECT COUNT(*) as count FROM (${baseQuery}) as Target;`;
    const dataCount = await Models.sequelize.query(countQuery, {
        type: Models.sequelize.QueryTypes.SELECT,
        replacements,
        plain: true,
        transaction: trx
    });
    const count = Number(dataCount.count);

    return { rows, count };
};

module.exports = exports;
