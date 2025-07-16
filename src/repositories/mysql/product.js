const Models = require('../../models/mysql');

exports.create = function (payload, trx = null) {
    return Models.Product.create(payload, { transaction: trx });
};

exports.createOrUpdate = function (payload, trx = null) {
    return Models.Product.upsert(payload, { transaction: trx });
};

exports.findOne = function (where, opts = {}, trx = null) {
    return Models.Product.findOne({ where, ...opts, transaction: trx });
};

exports.findOneWithExamPackage = function (where, opts = {}, trx = null) {
    opts.include = [
        {
            model: Models.ExamPackage,
            required: true
        }
    ];

    return Models.Product.findOne({ where, ...opts, transaction: trx });
};

exports.findOneWithPackage = function (where, opts = {}, trx = null) {
    return Models.Product.findOne({
        where,
        include: [
            { model: Models.ExamPackage },
            { model: Models.EssayPackage, as: 'essayPackage' }
        ],
        ...opts,
        transaction: trx
    });
};

exports.findAllWithPackage = function (where, opts = {}, trx = null) {
    return Models.Product.findAll({
        where,
        include: [
            { model: Models.ExamPackage },
            { model: Models.EssayPackage, as: 'essayPackage' }
        ],
        ...opts,
        transaction: trx
    });
};

module.exports = exports;
