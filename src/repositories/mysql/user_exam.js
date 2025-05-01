const Models = require('../../models/mysql');

exports.findAndCountAll = function (where, opts = {}, trx = null) {
    return Models.UserExam.findAndCountAll({ where, ...opts, transaction: trx });
};

exports.findOne = function (where, opts = {}, trx = null) {
    return Models.UserExam.findOne({ where, ...opts, transaction: trx });
};

exports.findTheFinishedOne = function (where, opts = {}, trx = null) {
    const whereClause = {
        ...where,
        startDate: {
            [Models.Sequelize.Op.not]: null
        },
        endDate: {
            [Models.Sequelize.Op.not]: null
        }
    };

    return Models.UserExam.findOne({ where: whereClause, ...opts, transaction: trx });
};

exports.findActiveExam = function (where, opts = {}, trx = null) {
    const whereClause = {
        ...where,
        startDate: {
            [Models.Sequelize.Op.not]: null
        },
        endDate: {
            [Models.Sequelize.Op.eq]: null
        }
    };

    return Models.UserExam.findOne({ where: whereClause, ...opts, transaction: trx });
};

exports.create = function (payload, trx = null) {
    return Models.UserExam.create(payload, { transaction: trx });
};

exports.update = function (where, payload, trx = null) {
    return Models.UserExam.update(payload, { where, transaction: trx });
};

exports.delete = function (where, trx = null) {
    return Models.UserExam.destroy({ where, transaction: trx });
};

module.exports = exports;
