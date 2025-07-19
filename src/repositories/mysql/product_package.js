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
    EssayPackage.id, 
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
    EssayPackage.*, 
    essayPackageMappings.uuid AS \`essayPackageMappings.uuid\`, 
    essayPackageMappings.essay_package_id AS \`essayPackageMappings.essayPackageId\`, 
    essayPackageMappings.essay_id AS \`essayPackageMappings.essayId\`, 
    (essayPackageMappings.max_attempt * UserPurchase.count) AS \`essayPackageMappings.maxAttempt\`, 
    essayPackageMappings.current_attempt AS \`essayPackageMappings.currentAttempt\`, 
    \`essayPackageMappings->essay\`.id AS \`essayPackageMappings.essay.id\`, 
    \`essayPackageMappings->essay\`.uuid AS \`essayPackageMappings.essay.uuid\`, 
    \`essayPackageMappings->essay\`.title AS \`essayPackageMappings.essay.title\`, 
    \`essayPackageMappings->essay\`.description AS \`essayPackageMappings.essay.description\`, 
    \`essayPackageMappings->essay\`.is_active AS \`essayPackageMappings.essay.isActive\` 
FROM 
    ( 
        SELECT 
            EssayPackage.id, 
            EssayPackage.uuid, 
            EssayPackage.title, 
            EssayPackage.description, 
            EssayPackage.additional_information AS additionalInformation, 
            EssayPackage.price, 
            EssayPackage.total_max_attempt AS totalMaxAttempt, 
            EssayPackage.default_item_max_attempt AS defaultItemMaxAttempt, 
            EssayPackage.payment_url AS paymentUrl, 
            EssayPackage.is_active AS isActive 
        FROM 
            essay_packages AS EssayPackage 
        WHERE 
            ( 
                EssayPackage.deleted_at IS NULL 
                AND EssayPackage.is_active = :isActive 
                AND EssayPackage.uuid = :uuid 
            )  
        LIMIT 
            1 
    ) AS EssayPackage 
    JOIN
        ( 
            SELECT 
                essay_package_mappings.uuid, 
                essay_package_mappings.essay_package_id, 
                essay_package_mappings.essay_id, 
                essay_package_mappings.max_attempt, 
                UserEssay.count AS current_attempt 
            FROM 
                essay_package_mappings 
                LEFT JOIN ( 
                    SELECT 
                        essay_id, 
                        essay_package_id, 
                        COUNT(*) as count 
                    FROM 
                        user_essays 
                    WHERE 
                        deleted_at IS NULL 
                        AND user_id = :userId  
                    GROUP BY  
                        essay_id, 
                        essay_package_id 
                ) AS UserEssay ON UserEssay.essay_package_id = essay_package_mappings.essay_package_id 
                AND UserEssay.essay_id = essay_package_mappings.essay_id 
            WHERE 
                essay_package_mappings.deleted_at IS NULL 
        ) AS essayPackageMappings ON EssayPackage.id = essayPackageMappings.essay_package_id 
    JOIN essays AS \`essayPackageMappings->essay\` ON essayPackageMappings.essay_id = \`essayPackageMappings->essay\`.id 
    AND \`essayPackageMappings->essay\`.deleted_at IS NULL 
    AND \`essayPackageMappings->essay\`.is_active = :isActive 
    JOIN ( 
        SELECT 
            user_id, 
            essay_package_id, 
            COUNT(*) as count 
        FROM 
            user_purchases 
        WHERE 
            user_purchases.deleted_at IS NULL 
        GROUP BY 
            user_id, 
            essay_package_id 
    ) AS UserPurchase ON UserPurchase.essay_package_id = EssayPackage.id  
    AND UserPurchase.user_id = :userId;
    `;

    const replacements = {
        ...where,
        uuid: where.uuid ?? 'IS NOT NULL',
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
    EssayPackage.*, 
    (essayPackageMappings.max_attempt * UserPurchase.count) AS itemMaxAttempt, 
    UserEssay.count AS currentAttempt 
FROM 
    ( 
        SELECT 
            EssayPackage.id, 
            EssayPackage.uuid, 
            EssayPackage.title, 
            EssayPackage.description, 
            EssayPackage.additional_information AS additionalInformation, 
            EssayPackage.price, 
            EssayPackage.total_max_attempt AS totalMaxAttempt, 
            EssayPackage.default_item_max_attempt AS defaultItemMaxAttempt, 
            EssayPackage.payment_url AS paymentUrl, 
            EssayPackage.is_active AS isActive 
        FROM 
            essay_packages AS EssayPackage 
        WHERE 
            ( 
                EssayPackage.deleted_at IS NULL 
                AND EssayPackage.is_active = :isActive 
                AND EssayPackage.uuid = :uuid 
            )  
        LIMIT 
            1 
    ) AS EssayPackage 
    JOIN essay_package_mappings AS essayPackageMappings ON EssayPackage.id = essayPackageMappings.essay_package_id 
    AND essayPackageMappings.deleted_at IS NULL 
    JOIN essays AS \`essayPackageMappings->essay\` ON essayPackageMappings.essay_id = \`essayPackageMappings->essay\`.id 
    AND \`essayPackageMappings->essay\`.deleted_at IS NULL 
    AND \`essayPackageMappings->essay\`.is_active = :isActive 
    AND \`essayPackageMappings->essay\`.uuid = :essayUuid 
    JOIN ( 
        SELECT 
            user_id, 
            essay_package_id, 
            COUNT(*) as count 
        FROM 
            user_purchases 
        WHERE 
            user_purchases.deleted_at IS NULL 
        GROUP BY 
            user_id, 
            essay_package_id 
    ) AS UserPurchase ON UserPurchase.essay_package_id = EssayPackage.id  
    AND UserPurchase.user_id = :userId 
    LEFT JOIN ( 
        SELECT 
            essay_id, 
            essay_package_id, 
            COUNT(*) as count 
        FROM 
            user_essays 
        WHERE 
            user_essays.deleted_at IS NULL 
            AND user_essays.user_id = :userId 
        GROUP BY  
            essay_id, 
            essay_package_id 
    ) AS UserEssay ON UserEssay.essay_package_id = EssayPackage.id 
    AND UserEssay.essay_id = essayPackageMappings.essay_id;
    `;

    const replacements = {
        ...where,
        uuid: where.uuid ?? 'IS NOT NULL',
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
