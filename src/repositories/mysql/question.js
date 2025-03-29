const Models = require('../../models/mysql');

exports.findAll = function (where, opts = {}, trx = null) {
    return Models.Question.findAll({ where, ...opts, transaction: trx });
};

exports.findOne = function (where, opts = {}, trx = null) {
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
        }
    ];

    opts.include = include;

    return Models.Question.findAll({ where: whereClause, ...opts, transaction: trx });
};

module.exports = exports;
