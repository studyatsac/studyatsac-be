const Models = require('../../models/mysql');

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

module.exports = exports;
