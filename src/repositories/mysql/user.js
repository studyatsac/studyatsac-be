const Models = require('../../models/mysql');

exports.findOne = function (where, opts = {}, trx = null) {
    const queryOpts = { where, ...opts, transaction: trx };
    if (opts.includeRoles) {
        queryOpts.include = queryOpts.include || [];
        queryOpts.include.push({
            model: Models.Role,
            through: { attributes: [] }
        });
    }
    return Models.User.findOne(queryOpts);
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

exports.findAndCountAll = function (where = {}, opts = {}, trx = null) {
    return Models.User.findAndCountAll({ where, ...opts, transaction: trx });
};

exports.countAll = function (where = {}, trx = null) {
    return Models.User.count({ where, transaction: trx });
};

exports.delete = function (where, trx = null) {
    return Models.User.destroy({ where, transaction: trx });
};

module.exports = exports;
