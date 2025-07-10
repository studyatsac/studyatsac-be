const Models = require('../../models/mysql');
const Response = require('../../utils/response');

const getPaidEssayReviewPackage = async (input, opts = {}) => {
    const language = opts.lang;

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
        ...input,
        uuid: input.essayPackageUuid ?? 'IS NOT NULL',
        userId: input.userId ?? 'IS NOT NULL',
        essayUuid: input.essayUuid ?? 'IS NOT NULL',
        isActive: input.isActive ?? true
    };

    const essay = await Models.sequelize.query(query, {
        type: Models.sequelize.QueryTypes.SELECT,
        replacements,
        raw: true,
        nest: true
    });

    let essayPackage = essay;
    if (Array.isArray(essay)) {
        essayPackage = essay[0];
    }
    if (!essayPackage) {
        return Response.formatServiceReturn(false, 404, null, language.ESSAY_PACKAGE.NOT_FOUND);
    }

    return Response.formatServiceReturn(true, 200, essayPackage, null);
};

exports.getPaidEssayReviewPackage = getPaidEssayReviewPackage;

module.exports = exports;
