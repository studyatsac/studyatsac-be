const Moment = require('moment');

const Models = require('../../models/mysql');

exports.findAndCountAll = function (where, opts = {}, trx = null) {
    const { categoryId, excludeExamPackageId, ...whereClause } = where;

    if (categoryId) {
        opts.include = [
            {
                model: Models.ExamPackageCategory,
                where: { masterCategoryId: categoryId }
            }
        ];
    }

    if (excludeExamPackageId?.length > 0) {
        whereClause.id = {
            [Models.Sequelize.Op.notIn]: excludeExamPackageId
        };
    }

    return Models.ExamPackage.findAndCountAll({
        where: whereClause,
        ...opts,
        transaction: trx
    });
};

exports.findAndCountAllWithUserPurchase = async function (where, opts = {}, trx = null) {
    const {
        categoryId,
        excludeExamPackageId,
        userId,
        ...whereClause
    } = where;

    opts.include = [];

    if (categoryId) {
        opts.include.push({
            model: Models.ExamPackageCategory,
            where: { masterCategoryId: categoryId }
        });
    }

    if (excludeExamPackageId?.length > 0) {
        whereClause.id = {
            [Models.Sequelize.Op.notIn]: excludeExamPackageId
        };
    }

    if (userId) {
        opts.include.push({
            model: Models.UserPurchase,
            required: false,
            where: {
                userId,
                expiredAt: {
                    [Models.Sequelize.Op.gte]: Moment.utc().format()
                }
            }
        });
    }

    const count = await Models.ExamPackage.count({ where: whereClause });
    const rows = await Models.ExamPackage.findAll({
        where: whereClause,
        ...opts,
        transaction: trx
    });

    return { rows, count };
};

exports.findOne = function (where, opts = {}, trx = null) {
    return Models.ExamPackage.findOne({
        where,
        ...opts,
        transaction: trx
    });
};

// Tambah fungsi update
exports.update = function (where, payload, trx = null) {
    return Models.ExamPackage.update(payload, { where, transaction: trx });
};

// Tambah fungsi create
exports.create = function (payload, trx = null) {
    return Models.ExamPackage.create(payload, { transaction: trx });
};

// Tambah fungsi delete
exports.delete = function (where, trx = null) {
    return Models.ExamPackage.destroy({ where, transaction: trx });
};

module.exports = exports;
