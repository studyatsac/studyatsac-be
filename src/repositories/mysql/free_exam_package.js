const Moment = require('moment');

const Models = require('../../models/mysql');

exports.findAndCountAll = function (where, opts = {}, trx = null) {
    return Models.FreeExamPackage.findAndCountAll({ where, ...opts, transaction: trx });
};

exports.findAll = function (where, opts = {}, trx = null) {
    return Models.FreeExamPackage.findAll({ where, ...opts, transaction: trx });
};

exports.findOne = function (where, opts = {}, trx = null) {
    return Models.FreeExamPackage.findOne({ where, ...opts, transaction: trx });
};

exports.findAllWithUserPurchase = async function (where, opts = {}, trx = null) {
    const { userId, ...whereClause } = where;

    const includeExamPackage = {
        model: Models.ExamPackage,
        required: true,
        include: [
            {
                model: Models.UserPurchase,
                required: false,
                where: {
                    userId,
                    expiredAt: {
                        [Models.Sequelize.Op.gte]: Moment.utc().format()
                    }
                }
            }
        ]
    };

    opts.include = [includeExamPackage];

    const rows = await Models.FreeExamPackage.findAll({ where: whereClause, ...opts, transaction: trx });

    return { rows };
};

exports.findOneWithExamPackage = async function (where, opts = {}, trx = null) {
    const includeExamPackage = {
        model: Models.ExamPackage,
        required: true
    };

    opts.include = [includeExamPackage];

    return Models.FreeExamPackage.findOne({ where, ...opts, transaction: trx });
};

module.exports = exports;
