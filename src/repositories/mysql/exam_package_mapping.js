const Models = require('../../models/mysql');

exports.findAllWithExam = function (where, opts = {}, trx = null) {
    const {
        categoryId,
        examPackageIds,
        ...whereClause
    } = where;

    const whereClauseExam = {};

    if (categoryId) {
        whereClauseExam.categoryId = categoryId;
    }

    const includeExam = {
        model: Models.Exam,
        required: true
    };

    if (Object.keys(whereClauseExam).length > 0) {
        includeExam.where = whereClauseExam;
    }

    const include = [
        includeExam
    ];

    opts.include = include;

    opts.limit = 100; // default limit

    whereClause.examPackageId = {
        [Models.Sequelize.Op.in]: examPackageIds
    };

    return Models.ExamPackageMapping.findAll({ where: whereClause, ...opts, transaction: trx });
};

exports.findOne = function (where, opts = {}, trx = null) {
    return Models.ExamPackageMapping.findAll({ where, ...opts, transaction: trx });
};

module.exports = exports;
