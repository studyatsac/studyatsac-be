const Models = require('../../models/mysql');

exports.findResources = function (questionId, opts = {}, trx = null) {
    return Models.Resources.findAll({
        include: [
            {
                model: Models.Resources,
                where: { question_id: questionId },
                attributes: []
            }
        ],
        ...opts,
        transaction: trx
    });
};

exports.findOne = function (where, opts = {}, trx = null) {
    return Models.Resources.findOne({ where, ...opts, transaction: trx });
};

exports.findAllResources = function (where, opts = {}, trx = null) {
    return Models.Resources.findAll({ where, ...opts, transaction: trx });
};

exports.findAllAndCount = function (where, opts = {}, trx = null) {
    return Models.Resources.findAndCountAll({ where, ...opts, transaction: trx });
};

exports.create = function (data, opts = {}, trx = null) {
    return Models.Resources.create(data, { ...opts, transaction: trx });
};

exports.update = function (payload, where, trx = null) {
    return Models.Resources.update(payload, { where, transaction: trx });
};

exports.delete = function (where, trx = null) {
    return Models.Resources.destroy({ where, transaction: trx });
};

module.exports = exports;
