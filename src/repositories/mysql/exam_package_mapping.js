const Models = require('../../models/mysql');

exports.findAllWithExamAndPackage = function (where, opts = {}, trx = null) {
    const {
        search, // <-- Parameter search diambil di sini
        categoryId,
        examPackageIds,
        ...whereClause
    } = where;

    const includeExam = {
        model: Models.Exam,
        required: true
    };
    const includeExamPackage = {
        model: Models.ExamPackage,
        required: true
    };

    // Logika untuk menambahkan filter pencarian
    if (search) {
        const searchCondition = {
            [Models.Sequelize.Op.like]: `%${search}%`
        };
        includeExam.where = {
            ...includeExam.where,
            title: searchCondition
        };
        includeExamPackage.where = {
            ...includeExamPackage.where,
            title: searchCondition
        };
    }

    if (categoryId) {
        includeExam.where = {
            ...includeExam.where,
            categoryId: categoryId
        };
    }

    const include = [
        includeExam,
        includeExamPackage
    ];

    opts.include = include;

    whereClause.examPackageId = {
        [Models.Sequelize.Op.in]: examPackageIds
    };

    return Models.ExamPackageMapping.findAndCountAll({ where: whereClause, ...opts, transaction: trx });
};
exports.findOneWithExamAndPackage = function (where, opts = {}, trx = null) {
    const include = [{
        model: Models.Exam,
        as: 'exam' // Pastikan alias ini benar
    }, {
        model: Models.ExamPackage,
        as: 'exam_package' // Pastikan alias ini benar
    }];

    return Models.ExamPackageMapping.findOne({ where, include, ...opts, transaction: trx });
};
exports.findAndCountAll = function (where, opts = {}, trx = null) {
    return Models.ExamPackageMapping.findAndCountAll({ where, ...opts, transaction: trx });
};

exports.create = function (payload, trx = null) {
    return Models.ExamPackageMapping.create(payload, { transaction: trx });
};

exports.createMany = function (payload, trx = null) {
    return Models.ExamPackageMapping.bulkCreate(payload, { transaction: trx });
};

exports.update = function (payload, where, trx = null) {
    return Models.ExamPackageMapping.update(payload, { where, transaction: trx });
};

exports.delete = function (where, opts = {}, trx = null) {
    return Models.ExamPackageMapping.destroy({ where, ...opts, transaction: trx });
};


module.exports = exports;
