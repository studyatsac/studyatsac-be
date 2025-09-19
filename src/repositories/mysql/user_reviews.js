const Models = require('../../models/mysql');

exports.create = function (payload, trx = null) {
    return Models.UserReviews.create(payload, { transaction: trx });
};

exports.findAndCountAll = function (where, opts = {}, trx = null) {
    return Models.UserReviews.findAndCountAll({ where, ...opts, transaction: trx });
};

module.exports = exports;