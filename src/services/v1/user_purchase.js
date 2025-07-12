const Moment = require('moment');
const UserPurchaseRepository = require('../../repositories/mysql/user_purchase');
const ProductRepository = require('../../repositories/mysql/product');
const UserRepository = require('../../repositories/mysql/user');
const ExamPackageRepository = require('../../repositories/mysql/exam_package');
const EssayPackageRepository = require('../../repositories/mysql/essay_package');
const MasterCategoryRepository = require('../../repositories/mysql/master_category');
const ExamPackageMappingRepository = require('../../repositories/mysql/exam_package_mapping');
const Response = require('../../utils/response');
const Models = require('../../models/mysql');
const Helpers = require('../../utils/helpers');

const getMyExamPackage = async (input, opts = {}) => {
    const whereClause = {
        userId: input.user.id
    };

    const optionsClause = {
        order: [['created_at', 'desc']],
        limit: 100
    };

    const userPurchase = await UserPurchaseRepository.findWithExamPackageAndCategoryAndCountAll(whereClause, optionsClause);

    const userPurchaseMap = new Map();

    userPurchase.rows.forEach((item) => {
        let purchase = userPurchaseMap.get(item.id);

        if (purchase) {
            const category = {
                id: item.category_id,
                uuid: item.category_uuid,
                title: item.category_title
            };

            purchase.categories = [...purchase.categories, category];
            userPurchaseMap.set(item.id, purchase);
        } else {
            const category = {
                id: item.category_id,
                uuid: item.category_uuid,
                title: item.category_title
            };

            purchase = {
                ...item,
                categories: [category]
            };

            userPurchaseMap.set(item.id, purchase);
        }
    });

    const data = { rows: [...userPurchaseMap.values()], count: userPurchase.count };

    return Response.formatServiceReturn(true, 200, data, null);
};

const getMyExam = async (input, opts = {}) => {
    const whereClauseUserPurchase = {
        user_id: input.user.id
    };

    const whereClauseExam = {};

    if (input.examPackageUuid) {
        const examPackage = await ExamPackageRepository.findOne({
            uuid: input.examPackageUuid
        });

        if (!examPackage) {
            return Response.formatServiceReturn(true, 200, [], null);
        }

        whereClauseUserPurchase.examPackageId = examPackage.id;
    }

    if (input.categoryUuid) {
        const masterCategory = await MasterCategoryRepository.findOne({
            uuid: input.categoryUuid
        });

        if (!masterCategory) {
            return Response.formatServiceReturn(true, 200, [], null);
        }

        whereClauseExam.categoryId = masterCategory.id;
    }

    const userPurchases = await UserPurchaseRepository.findAllExcludeExpired(whereClauseUserPurchase);

    if (userPurchases.length === 0) {
        return Response.formatServiceReturn(true, 200, [], null);
    }

    whereClauseExam.examPackageIds = userPurchases.map((userPurchase) => userPurchase.examPackageId);

    const examPackageMappings = await ExamPackageMappingRepository.findAllWithExam(whereClauseExam);

    return Response.formatServiceReturn(true, 200, examPackageMappings, null);
};

const getUserPurchaseEssayPackageList = async (input, opts = {}) => {
    const language = opts.lang;
    const params = opts.params;

    const allEssayPackage = await UserPurchaseRepository.findAndCountAll({
        essayPackageId: { [Models.Op.not]: null },
        ...input,
        ...(params.search ? {
            [Models.Op.or]: [
                {
                    '$User.full_name$': {
                        [Models.Op.like]: `%${params.search}%`
                    }
                },
                {
                    '$essayPackage.title$': {
                        [Models.Op.like]: `%${params.search}%`
                    }
                }
            ]
        } : {})
    }, {
        include: [
            { model: Models.User },
            { model: Models.EssayPackage, as: 'essayPackage' }
        ],
        order: [['created_at', 'desc']],
        limit: params.limit,
        offset: Helpers.setOffset(params.page, params.limit)
    });

    if (!allEssayPackage) {
        return Response.formatServiceReturn(false, 404, null, language.USER_PURCHASE.NOT_FOUND);
    }

    return Response.formatServiceReturn(true, 200, allEssayPackage, null);
};

const injectUserPurchase = async (input, opts = {}) => {
    const user = await UserRepository.findOne({ email: input.email });

    if (!user) {
        return Response.formatServiceReturn(false, 404, null, 'User not found');
    }

    const examPackage = await ExamPackageRepository.findOne({ uuid: input.examPackageUuid });

    if (!examPackage) {
        return Response.formatServiceReturn(false, 404, null, 'Exam package not found');
    }

    const activeExamPackage = await UserPurchaseRepository.findOneExcludeExpired({ userId: user.id, examPackageId: examPackage.id });

    if (activeExamPackage) {
        return Response.formatServiceReturn(false, 429, null, 'Exam package still active');
    }

    const userPurchasePayload = {
        userId: user.id,
        examPackageId: examPackage.id,
        expiredAt: Moment().add(input.expiredIn, 'days').format()
    };

    const userPurchased = await UserPurchaseRepository.create(userPurchasePayload);

    const paidProduct = await ProductRepository.findOne({ examPackageId: examPackage.id });

    if (paidProduct) {
        const hotsPackageActive = await UserPurchaseRepository.findOneExcludeExpired({ userId: user.id, examPackageId: process.env.HOTS_PACKAGE_ID });

        if (!hotsPackageActive) {
            await UserPurchaseRepository.create({
                userId: user.id,
                examPackageId: process.env.HOTS_PACKAGE_ID,
                expiredAt: Moment().add(input.expiredIn, 'days').format()
            });
        }
    }

    return Response.formatServiceReturn(true, 200, userPurchased, null);
};

const createUserPurchase = async (input, opts = {}) => {
    const language = opts.lang;

    const user = await UserRepository.findOne({ uuid: input.userUuid });
    if (!user) {
        return Response.formatServiceReturn(false, 404, null, language.USER_NOT_FOUND);
    }

    let examPackage;
    if (input.examPackageUuid) {
        examPackage = await ExamPackageRepository.findOne({ uuid: input.examPackageUuid });
        if (!examPackage) {
            return Response.formatServiceReturn(false, 404, null, language.EXAM_PACKAGE_NOT_FOUND);
        }
    }

    let essayPackage;
    if (input.essayPackageUuid) {
        essayPackage = await EssayPackageRepository.findOne({ uuid: input.essayPackageUuid });
        if (!essayPackage) {
            return Response.formatServiceReturn(false, 404, null, language.ESSAY_PACKAGE.NOT_FOUND);
        }
    }

    if (!examPackage && !essayPackage) {
        return Response.formatServiceReturn(false, 404, null, language.PACKAGE_NOT_FOUND);
    }

    const userPurchase = await UserPurchaseRepository.create({
        userId: user.id,
        examPackageId: examPackage?.id,
        essayPackageId: essayPackage?.id,
        externalTransactionId: input.externalTransactionId,
        expiredAt: input.expiredIn ?? Moment().add(365, 'days').format()
    });
    if (!userPurchase) {
        return Response.formatServiceReturn(false, 500, null, language.USER_PURCHASE.CREATE_FAILED);
    }

    return Response.formatServiceReturn(true, 200, userPurchase, null);
};

const claimUserPurchaseEssayPackage = async (input, opts = {}) => {
    const language = opts.lang;

    let userPurchase = await UserPurchaseRepository.findOne({
        userId: input.userId,
        essayPackageId: input.essayPackageId
    });
    if (userPurchase) {
        return Response.formatServiceReturn(false, 400, null, language.USER_PURCHASE.ESSAY_PACKAGE_ALREADY_CLAIMED);
    }

    userPurchase = await UserPurchaseRepository.create({
        userId: input.userId,
        essayPackageId: input.essayPackageId,
        expiredAt: Moment().add(365, 'days').format()
    });
    if (!userPurchase) {
        return Response.formatServiceReturn(false, 500, null, language.USER_PURCHASE.ESSAY_PACKAGE_CLAIM_FAILED);
    }

    return Response.formatServiceReturn(true, 200, userPurchase, null);
};

const deleteUserPurchase = async (input, opts = {}) => {
    const language = opts.lang;

    const userPurchase = await UserPurchaseRepository.findOne(input);

    if (!userPurchase) {
        return Response.formatServiceReturn(false, 404, null, language.USER_PURCHASE.NOT_FOUND);
    }

    await UserPurchaseRepository.delete({ id: userPurchase.id });

    return Response.formatServiceReturn(true, 200, null, language.USER_PURCHASE.DELETE_SUCCESS);
};

exports.getMyExamPackage = getMyExamPackage;
exports.getMyExam = getMyExam;
exports.getUserPurchaseEssayPackageList = getUserPurchaseEssayPackageList;
exports.injectUserPurchase = injectUserPurchase;
exports.claimUserPurchaseEssayPackage = claimUserPurchaseEssayPackage;
exports.createUserPurchase = createUserPurchase;
exports.deleteUserPurchase = deleteUserPurchase;

module.exports = exports;
