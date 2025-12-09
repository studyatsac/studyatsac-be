const { Op } = require('sequelize');
const Models = require('../../models/mysql');

exports.findAndCountAll = function (where, opts = {}, trx = null) {
    return Models.Promos.findAndCountAll({ where, ...opts, transaction: trx });
};

exports.findOne = function (where, opts = {}, trx = null) {
    return Models.Promos.findOne({ where, ...opts, transaction: trx });
};

exports.findAllActivePromos = function (opts = {}, trx = null) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const where = {
        start_date: {
            [Op.lte]: today
        },
        end_date: {
            [Op.gte]: today
        }
    };

    return Models.Promos.findAll({ where, ...opts, transaction: trx });
};

exports.findAndCountAllActivePromos = function (opts = {}, trx = null) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const where = {
        start_date: {
            [Op.lte]: today
        },
        end_date: {
            [Op.gte]: today
        }
    };

    return Models.Promos.findAndCountAll({ where, ...opts, transaction: trx });
};

exports.create = function (data, opts = {}, trx = null) {
    return Models.Promos.create(data, { ...opts, transaction: trx });
};

exports.update = function (payload, where, trx = null) {
    return Models.Promos.update(payload, { where, transaction: trx });
};

exports.delete = function (where, trx = null) {
    return Models.Promos.destroy({ where, transaction: trx });
};

module.exports = exports;
