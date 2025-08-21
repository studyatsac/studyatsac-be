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

exports.findAllResources = function (where, opts = {}, trx = null) {
    return Models.Resources.findAll({ where, ...opts, transaction: trx });
};

exports.create = function (data, opts = {}, trx = null) {
    return Models.Resources.create(data, { ...opts, transaction: trx });
};

module.exports = exports;
