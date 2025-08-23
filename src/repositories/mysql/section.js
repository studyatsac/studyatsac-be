const Models = require('../../models/mysql');

exports.findSections = function (questionId, opts = {}, trx = null) {
    // Mirip dengan resources.js, ambil section yang terkait dengan question tertentu
    return Models.Section.findAll({
        include: [
            {
                model: Models.Question,
                as: 'questions', // gunakan alias jika ada di model
                where: { id: questionId },
                attributes: [],
                required: true
            }
        ],
        ...opts,
        transaction: trx
    });
};

exports.findAndCountAll = function (where, opts = {}, trx = null) {
    return Models.Section.findAndCountAll({
        where,
        ...opts,
        transaction: trx
    });
};

exports.findOne = function (where, opts = {}, trx = null) {
    return Models.Section.findOne({ where, ...opts, transaction: trx });
};

exports.update = function (payload, where, trx = null) {
    return Models.Section.update(payload, { where, transaction: trx });
};

exports.delete = function (where, trx = null) {
    return Models.Section.destroy({ where, transaction: trx });
};

module.exports = exports;
