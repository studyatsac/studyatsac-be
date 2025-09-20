const Models = require('../../models/mysql');

// exports.findAllWithExamAndPackage = function (where, opts = {}, trx = null) {
//     const {
//         search, // <-- Parameter search diambil di sini
//         categoryId,
//         examPackageIds,
//         ...whereClause
//     } = where;
//
//     const whereClauseExam = {};
//
//     if (categoryId) {
//         whereClauseExam.categoryId = categoryId;
//     }
//
//     const includeExam = {
//         model: Models.Exam,
//         as: 'exam',
//         required: true
//     };
//     const includeExamPackage = {
//         model: Models.ExamPackage,
//         as: 'exam_package',
//         required: true
//     };
//
//     if (Object.keys(whereClauseExam).length > 0) {
//         includeExam.where = whereClauseExam;
//     }
//
//     // Logika untuk menambahkan filter pencarian
//     if (search) {
//         const searchCondition = {
//             [Models.Sequelize.Op.like]: `%${search}%`
//         };
//         includeExam.where = {
//             ...includeExam.where,
//             title: searchCondition
//         };
//         includeExamPackage.where = {
//             ...includeExamPackage.where,
//             title: searchCondition
//         };
//     }
//
//     if (categoryId) {
//         includeExam.where = {
//             ...includeExam.where,
//             categoryId
//         };
//     }
//
//     const include = [
//         includeExam,
//         includeExamPackage
//     ];
//
//     opts.include = include;
//
//     whereClause.examPackageId = {
//         [Models.Sequelize.Op.in]: examPackageIds
//     };
//
//     return Models.ExamPackageMapping.findAndCountAll({ where: whereClause, ...opts, transaction: trx });
// };

exports.findAllWithExamAndPackage = function (where, opts = {}, trx = null) {
    const {
        search,
        categoryId,
        examPackageIds
    } = where;

    // Definisikan klausa where untuk masing-masing model
    const examWhereClause = {};
    const examPackageWhereClause = {};

    // Terapkan pencarian dan filter ke klausa where yang relevan
    if (search) {
        examWhereClause.title = {
            [Models.Sequelize.Op.like]: `%${search}%`
        };
        examPackageWhereClause.title = {
            [Models.Sequelize.Op.like]: `%${search}%`
        };
    }

    if (categoryId) {
        examWhereClause.categoryId = categoryId;
    }

    const mainWhereClause = {};

    if (examPackageIds && examPackageIds.length > 0) {
        mainWhereClause.examPackageId = {
            [Models.Sequelize.Op.in]: examPackageIds
        };
    }

    // Buat objek include dengan klausa where yang sudah didefinisikan
    const include = [{
        model: Models.Exam,
        as: 'exam',
        required: false,
        where: examWhereClause
    }, {
        model: Models.ExamPackage,
        as: 'exam_package',
        required: false,
        where: examPackageWhereClause
    }];

    return Models.ExamPackageMapping.findAndCountAll({
        where: mainWhereClause,
        include,
        ...opts,
        distinct: true,
        transaction: trx
    });
};

exports.findAllSimple = function () {
    return Models.ExamPackageMapping.findAndCountAll({
        limit: 10 // Ambil 10 data pertama saja
    });
};

exports.findOneWithExamAndPackage = function (where, opts = {}, trx = null) {
    const include = [{
        model: Models.Exam,
        as: 'exam' // Pastikan alias ini benar
    }, {
        model: Models.ExamPackage,
        as: 'exam_package' // Pastikan alias ini benar
    }];

    return Models.ExamPackageMapping.findOne({
        where, include, ...opts, transaction: trx
    });
};
exports.findAndCountAll = function (where, opts = {}, trx = null) {
    return Models.ExamPackageMapping.findAndCountAll({ where, ...opts, transaction: trx });
};

exports.findOne = function (where, opts = {}, trx = null) {
    const include = opts.include || [];
    include.push({
        model: Models.ExamPackage,
        as: 'exam_package',
        required: false
    });
    include.push({
        model: Models.Exam,
        as: 'exam',
        required: false
    });
    opts.include = include;
    return Models.ExamPackageMapping.findOne({ where, ...opts, transaction: trx });
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
