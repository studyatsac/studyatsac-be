const Moment = require('moment');

const MasterCategoryRepository = require('../../repositories/mysql/master_category');
const ExamPackageRepository = require('../../repositories/mysql/exam_package');
const UserPurchaseRepository = require('../../repositories/mysql/user_purchase');
const FreeExamPackageRepository = require('../../repositories/mysql/free_exam_package');
const Helpers = require('../../utils/helpers');
const Response = require('../../utils/response');

const getListExamPackage = async (input, opts = {}) => {
    const language = opts.lang;

    const whereClause = {};
    const optionsClause = {
        order: [['created_at', 'desc']],
        limit: input.limit,
        offset: Helpers.setOffset(input.page, input.limit)
    };

    let category;

    if (input.categoryUuid) {
        category = await MasterCategoryRepository.findOne({ uuid: input.categoryUuid });

        if (!category) {
            return Response.formatServiceReturn(false, 404, null, language.CATEGORY_NOT_FOUND);
        }

        whereClause.categoryId = category.id;
    }

    let excludeExamPackageIds = [];

    if (input.excludePurchased) {
        const userPurchases = await UserPurchaseRepository.findAllExcludeExpired({
            userId: input.user.id
        });

        if (userPurchases.length > 0) {
            excludeExamPackageIds = [
                ...excludeExamPackageIds,
                ...userPurchases.map((item) => item.examPackageId)
            ];
        }
    }

    const freeExamPackages = await FreeExamPackageRepository.findAll();

    if (freeExamPackages.length > 0) {
        excludeExamPackageIds = [
            ...excludeExamPackageIds,
            ...freeExamPackages.map((item) => item.examPackageId)
        ];
    }

    whereClause.excludeExamPackageId = excludeExamPackageIds;
    if (input?.user?.id) {
        whereClause.userId = input.user.id;
    }

    whereClause.isPrivate = false;

    const examPackages = await ExamPackageRepository.findAndCountAllWithUserPurchase(whereClause, optionsClause);

    const data = { rows: examPackages.rows, count: examPackages.count };

    return Response.formatServiceReturn(true, 200, data, null);
};

const getListFreeExamPackage = async (input, opts = {}) => {
    const whereClause = {};
    const optionsClause = {
        order: [['created_at', 'desc']],
        limit: 100
    };

    whereClause.userId = input.user.id;

    const freeExamPackages = await FreeExamPackageRepository.findAllWithUserPurchase(whereClause, optionsClause);

    const filteredFreeExamPackages = freeExamPackages.rows.filter((item) => item.ExamPackage.UserPurchases.length < 1);

    const data = { rows: filteredFreeExamPackages };

    return Response.formatServiceReturn(true, 200, data, null);
};

const claimFreeExamPackage = async (input, opts = {}) => {
    const user = input.user;

    if (!user) {
        return Response.formatServiceReturn(false, 404, null, 'User not found');
    }

    const freeExamPackage = await FreeExamPackageRepository.findOneWithExamPackage({ uuid: input.uuid });

    if (!freeExamPackage) {
        return Response.formatServiceReturn(false, 404, null, 'Free Exam package not found');
    }

    const examPackage = freeExamPackage.ExamPackage;

    const activeExamPackage = await UserPurchaseRepository.findOneExcludeExpired({ userId: user.id, examPackageId: examPackage.id });

    if (activeExamPackage) {
        return Response.formatServiceReturn(false, 429, null, 'Exam package still active');
    }

    const userPurchasePayload = {
        userId: user.id,
        examPackageId: examPackage.id,
        expiredAt: Moment().add(365, 'days').format()
    };

    const userPurchased = await UserPurchaseRepository.create(userPurchasePayload);

    return Response.formatServiceReturn(true, 200, userPurchased, null);
};

exports.getListExamPackage = getListExamPackage;
exports.getListFreeExamPackage = getListFreeExamPackage;
exports.claimFreeExamPackage = claimFreeExamPackage;

module.exports = exports;
