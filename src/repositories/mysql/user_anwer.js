const Models = require('../../models/mysql');

exports.findOne = function (where, opts = {}, trx = null) {
    return Models.UserAnswer.findOne({ where, ...opts, transaction: trx });
};

exports.create = function (payload, trx = null) {
    return Models.UserAnswer.create(payload, { transaction: trx });
};

exports.update = function (where, payload, trx = null) {
    return Models.UserAnswer.update(payload, { where, transaction: trx });
};

exports.findAllWithQuestion = function (where, opts = {}, trx = null) {
    const include = [
        {
            model: Models.Question,
            required: true
        }
    ];

    opts.include = include;

    return Models.UserAnswer.findAll({ where, ...opts, transaction: trx });
};

module.exports = exports;
