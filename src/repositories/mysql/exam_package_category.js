const Models = require('../../models/mysql');

exports.findAllExamPackageWithCategory = function (where, opts = {}, trx = null) {
    const {
        search,
        examPackageId,
        masterCategoryId,
        ...whereClause
    } = where;

    const includeExamPackage = {
        model: Models.ExamPackage,
        as: 'exam_package',
        required: true
    };
    const includeMasterCategory = {
        model: Models.MasterCategory,
        as: 'master_category',
        required: true
    };

    if (search) {
        const searchCondition = {
            [Models.Sequelize.Op.like]: `%${search}%`
        };
        includeExamPackage.where = {
            ...includeExamPackage.where,
            title: searchCondition
        };
        includeMasterCategory.where = {
            ...includeMasterCategory.where,
            title: searchCondition
        };
    }

    if (examPackageId) {
        whereClause.examPackageId = examPackageId;
    }

    if (masterCategoryId) {
        whereClause.masterCategoryId = masterCategoryId;
    }

    const include = [includeExamPackage, includeMasterCategory];
    opts.include = include;

    return Models.ExamPackageCategory.findAndCountAll({ where: whereClause, ...opts, transaction: trx });
};

exports.findAndCountAll = function (where, opts = {}, trx = null) {
    return Models.ExamPackageCategory.findAndCountAll({ where, ...opts, transaction: trx });
};

exports.findOne = function (where, opts = {}, trx = null) {
    const include = opts.include || [];
    include.push({
        model: Models.ExamPackage,
        as: 'exam_package',
        required: false
    });
    include.push({
        model: Models.MasterCategory,
        as: 'master_category',
        required: false
    });
    opts.include = include;
    return Models.ExamPackageCategory.findOne({ where, ...opts, transaction: trx });
};

exports.create = function (payload, trx = null) {
    return Models.ExamPackageCategory.create(payload, { transaction: trx });
};

exports.update = function (payload, where, trx = null) {
    return Models.ExamPackageCategory.update(payload, { where, transaction: trx });
};

exports.delete = function (where, opts = {}, trx = null) {
    return Models.ExamPackageCategory.destroy({ where, ...opts, transaction: trx });
};

module.exports = exports;
