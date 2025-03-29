const Models = require('../../models/mysql');

exports.findOne = function (where, opts = {}, trx = null) {
    return Models.User.findOne({ where, ...opts, transaction: trx });
};

exports.findOneWithIeltsScore = function (where, opts = {}, trx = null) {
    const include = opts.include || [];

    include.push({
        model: Models.IeltsScore,
        required: false
    });

    opts.include = include;
    opts.order = [[{ model: Models.IeltsScore }, 'created_at', 'desc']];

    return Models.User.findOne({ where, ...opts, transaction: trx });
};

exports.create = function (payload, trx = null) {
    return Models.User.create(payload, { transaction: trx });
};

exports.update = function (where, payload, trx = null) {
    return Models.User.update(payload, { where, transaction: trx });
};

exports.findAll = function (where, opts = {}, trx = null) {
    return Models.User.findAll({ where, ...opts, transaction: trx });
};

module.exports = exports;
