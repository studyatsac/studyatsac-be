const Models = require('../../models/mysql');

exports.findAll = function (where, opts = {}, trx = null) {
    const include = opts.include || [];
    include.push({
        model: Models.Resources,
        as: 'resource',
        required: false
    });
    include.push({
        model: Models.Section,
        as: 'section',
        required: false
    });
    opts.include = include;

    return Models.Question.findAll({ where, ...opts, transaction: trx });
};

exports.findOne = function (where, opts = {}, trx = null) {
    const include = opts.include || [];
    include.push({
        model: Models.Resources,
        as: 'resource', // pastikan as sama dengan di model
        required: false
    });
    include.push({
        model: Models.Section,
        as: 'section',
        required: false
    });
    opts.include = include;
    return Models.Question.findOne({ where, ...opts, transaction: trx });
};

exports.findAllWithUserAnswer = function (where, opts = {}, trx = null) {
    const {
        userExamId,
        ...whereClause
    } = where;

    const include = [
        {
            model: Models.UserAnswer,
            required: false,
            where: {
                userExamId
            }
        },
        {
            model: Models.Resources,
            as: 'resource',
            required: false
        },
        {
            model: Models.Section,
            as: 'section',
            required: false
        }
    ];

    opts.include = include;

    return Models.Question.findAll({ where: whereClause, ...opts, transaction: trx });
};

exports.create = function (payload, trx = null) {
    return Models.Question.create(payload, { transaction: trx });
};

exports.findAndCountAll = function (where, opts = {}, trx = null) {
    return Models.Question.findAndCountAll({ where, ...opts, transaction: trx });
};

exports.update = function (payload, where, trx = null) {
    return Models.Question.update(payload, { where, transaction: trx });
};

exports.delete = function (where, trx = null) {
    return Models.Question.destroy({ where, transaction: trx });
};

module.exports = exports;
