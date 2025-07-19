const Models = require('../../models/mysql');

exports.findAll = function (where, opts = {}, trx = null) {
    return Models.ProductPackage.findAll({ where, ...opts, transaction: trx });
};

exports.findAndCountAll = function (where, opts = {}, trx = null) {
    return Models.ProductPackage.findAndCountAll({ where, ...opts, transaction: trx });
};

exports.findOne = function (where, opts = {}, trx = null) {
    return Models.ProductPackage.findOne({ where, ...opts, transaction: trx });
};

exports.create = function (payload, trx = null) {
    return Models.ProductPackage.create(payload, { transaction: trx });
};

exports.update = function (payload, where, trx = null) {
    return Models.ProductPackage.update(payload, { where, transaction: trx });
};

exports.delete = function (where, trx = null) {
    return Models.ProductPackage.destroy({ where, transaction: trx });
};

exports.findAndCountAllFromUserPurchase = async function (where, opts = {}, trx = null) {
    const baseQuery = `
SELECT DISTINCT 
    ProductPackage.id, 
    ProductPackage.uuid,
    ProductPackage.type, 
    ProductPackage.title, 
    ProductPackage.description, 
    ProductPackage.additional_information AS additionalInformation, 
    ProductPackage.price, 
    ProductPackage.total_max_attempt AS totalMaxAttempt, 
    ProductPackage.default_item_max_attempt AS defaultItemMaxAttempt, 
    ProductPackage.payment_url AS paymentUrl, 
    ProductPackage.is_active AS isActive, 
    ProductPackage.created_at
FROM 
    product_packages AS ProductPackage 
    JOIN user_purchases AS UserPurchase ON UserPurchase.product_package_id = ProductPackage.id  
WHERE 
    ( 
        ProductPackage.deleted_at IS NULL 
        AND ProductPackage.is_active = :isActive
        AND ProductPackage.type = :type
        AND UserPurchase.deleted_at IS NULL 
        AND UserPurchase.user_id = :userId 
    ) 
    `;

    const replacements = {
        ...where,
        userId: where.userId ?? 'IS NOT NULL',
        type: where.type ?? 'IS NOT NULL',
        isActive: where.isActive ?? true,
        limit: opts.limit,
        offset: opts.offset
    };

    const query = `${baseQuery} ORDER BY ProductPackage.created_at DESC LIMIT :limit OFFSET :offset;`;
    const rows = await Models.sequelize.query(query, {
        type: Models.sequelize.QueryTypes.SELECT,
        replacements,
        model: Models.ProductPackage,
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

exports.findOneWithMappingFromUserPurchase = async function (where, trx = null) {
    const query = `
SELECT 
    ProductPackage.*, 
    productPackageMappings.uuid AS \`productPackageMappings.uuid\`, 
    productPackageMappings.product_package_id AS \`productPackageMappings.productPackageId\`, 
    productPackageMappings.essay_id AS \`productPackageMappings.essayId\`, 
    (productPackageMappings.max_attempt * UserPurchase.count) AS \`productPackageMappings.maxAttempt\`, 
    productPackageMappings.current_attempt AS \`productPackageMappings.currentAttempt\`, 
    \`productPackageMappings->essay\`.id AS \`productPackageMappings.essay.id\`, 
    \`productPackageMappings->essay\`.uuid AS \`productPackageMappings.essay.uuid\`, 
    \`productPackageMappings->essay\`.title AS \`productPackageMappings.essay.title\`, 
    \`productPackageMappings->essay\`.description AS \`productPackageMappings.essay.description\`, 
    \`productPackageMappings->essay\`.is_active AS \`productPackageMappings.essay.isActive\` 
FROM 
    ( 
        SELECT 
            ProductPackage.id, 
            ProductPackage.uuid,
            ProductPackage.type, 
            ProductPackage.title, 
            ProductPackage.description, 
            ProductPackage.additional_information AS additionalInformation, 
            ProductPackage.price, 
            ProductPackage.total_max_attempt AS totalMaxAttempt, 
            ProductPackage.default_item_max_attempt AS defaultItemMaxAttempt, 
            ProductPackage.payment_url AS paymentUrl, 
            ProductPackage.is_active AS isActive 
        FROM 
            product_packages AS ProductPackage 
        WHERE 
            ( 
                ProductPackage.deleted_at IS NULL 
                AND ProductPackage.is_active = :isActive 
                AND ProductPackage.uuid = :uuid 
                AND ProductPackage.type = :type 
            )  
        LIMIT 
            1 
    ) AS ProductPackage 
    JOIN
        ( 
            SELECT 
                product_package_mappings.uuid, 
                product_package_mappings.product_package_id, 
                product_package_mappings.essay_id, 
                product_package_mappings.max_attempt, 
                UserEssay.count AS current_attempt 
            FROM 
                product_package_mappings 
                LEFT JOIN ( 
                    SELECT 
                        essay_id, 
                        product_package_id, 
                        COUNT(*) as count 
                    FROM 
                        user_essays 
                    WHERE 
                        deleted_at IS NULL 
                        AND user_id = :userId  
                    GROUP BY  
                        essay_id, 
                        product_package_id 
                ) AS UserEssay ON UserEssay.product_package_id = product_package_mappings.product_package_id 
                AND UserEssay.essay_id = product_package_mappings.essay_id 
            WHERE 
                product_package_mappings.deleted_at IS NULL 
        ) AS productPackageMappings ON ProductPackage.id = productPackageMappings.product_package_id 
    JOIN essays AS \`productPackageMappings->essay\` ON productPackageMappings.essay_id = \`productPackageMappings->essay\`.id 
    AND \`productPackageMappings->essay\`.deleted_at IS NULL 
    AND \`productPackageMappings->essay\`.is_active = :isActive 
    JOIN ( 
        SELECT 
            user_id, 
            product_package_id, 
            COUNT(*) as count 
        FROM 
            user_purchases 
        WHERE 
            user_purchases.deleted_at IS NULL 
        GROUP BY 
            user_id, 
            product_package_id 
    ) AS UserPurchase ON UserPurchase.product_package_id = ProductPackage.id  
    AND UserPurchase.user_id = :userId;
    `;

    const replacements = {
        ...where,
        uuid: where.uuid ?? 'IS NOT NULL',
        type: where.type ?? 'IS NOT NULL',
        userId: where.userId ?? 'IS NOT NULL',
        isActive: where.isActive ?? true
    };

    return Models.sequelize.query(query, {
        type: Models.sequelize.QueryTypes.SELECT,
        replacements,
        raw: true,
        nest: true,
        transaction: trx
    });
};

exports.findOneWithAttemptFormUserPurchase = async function (where, trx = null) {
    const query = `
SELECT 
    ProductPackage.*, 
    (productPackageMappings.max_attempt * UserPurchase.count) AS itemMaxAttempt, 
    UserEssay.count AS currentAttempt 
FROM 
    ( 
        SELECT 
            ProductPackage.id, 
            ProductPackage.uuid,
            ProductPackage.type, 
            ProductPackage.title, 
            ProductPackage.description, 
            ProductPackage.additional_information AS additionalInformation, 
            ProductPackage.price, 
            ProductPackage.total_max_attempt AS totalMaxAttempt, 
            ProductPackage.default_item_max_attempt AS defaultItemMaxAttempt, 
            ProductPackage.payment_url AS paymentUrl, 
            ProductPackage.is_active AS isActive 
        FROM 
            product_packages AS ProductPackage 
        WHERE 
            ( 
                ProductPackage.deleted_at IS NULL 
                AND ProductPackage.is_active = :isActive 
                AND ProductPackage.uuid = :uuid 
                AND ProductPackage.type = :type 
            )  
        LIMIT 
            1 
    ) AS ProductPackage 
    JOIN product_package_mappings AS productPackageMappings ON ProductPackage.id = productPackageMappings.product_package_id 
    AND productPackageMappings.deleted_at IS NULL 
    JOIN essays AS \`productPackageMappings->essay\` ON productPackageMappings.essay_id = \`productPackageMappings->essay\`.id 
    AND \`productPackageMappings->essay\`.deleted_at IS NULL 
    AND \`productPackageMappings->essay\`.is_active = :isActive 
    AND \`productPackageMappings->essay\`.uuid = :essayUuid 
    JOIN ( 
        SELECT 
            user_id, 
            product_package_id, 
            COUNT(*) as count 
        FROM 
            user_purchases 
        WHERE 
            user_purchases.deleted_at IS NULL 
        GROUP BY 
            user_id, 
            product_package_id 
    ) AS UserPurchase ON UserPurchase.product_package_id = ProductPackage.id  
    AND UserPurchase.user_id = :userId 
    LEFT JOIN ( 
        SELECT 
            essay_id, 
            product_package_id, 
            COUNT(*) as count 
        FROM 
            user_essays 
        WHERE 
            user_essays.deleted_at IS NULL 
            AND user_essays.user_id = :userId 
        GROUP BY  
            essay_id, 
            product_package_id 
    ) AS UserEssay ON UserEssay.product_package_id = ProductPackage.id 
    AND UserEssay.essay_id = productPackageMappings.essay_id;
    `;

    const replacements = {
        ...where,
        uuid: where.uuid ?? 'IS NOT NULL',
        type: where.type ?? 'IS NOT NULL',
        userId: where.userId ?? 'IS NOT NULL',
        essayUuid: where.essayUuid ?? 'IS NOT NULL',
        isActive: where.isActive ?? true
    };

    return Models.sequelize.query(query, {
        type: Models.sequelize.QueryTypes.SELECT,
        replacements,
        raw: true,
        nest: true,
        transaction: trx
    });
};

module.exports = exports;
