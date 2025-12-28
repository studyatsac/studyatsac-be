const Models = require('../../models/mysql');

exports.findOne = function (where, opts = {}, trx = null) {
    return Models.LeadSubmissions.findOne({ where, ...opts, transaction: trx });
};

exports.create = function (payload, trx = null) {
    return Models.LeadSubmissions.create(payload, { transaction: trx });
};

exports.update = function (where, payload, trx = null) {
    return Models.LeadSubmissions.update(payload, { where, transaction: trx });
};

exports.findAll = function (where, opts = {}, trx = null) {
    return Models.LeadSubmissions.findAll({ where, ...opts, transaction: trx });
};

exports.findAndCountAll = function (where = {}, opts = {}, trx = null) {
    const { search, ...otherOpts } = opts;

    let whereClause = { ...where };

    // If search parameter exists, add OR condition to search across multiple fields
    if (search) {
        const { Op } = require('sequelize');
        whereClause = {
            ...whereClause,
            [Op.or]: [
                { whatsapp_number: { [Op.like]: `%${search}%` } },
                { selected_program: { [Op.like]: `%${search}%` } }
            ]
        };
    }

    return Models.LeadSubmissions.findAndCountAll({ where: whereClause, ...otherOpts, transaction: trx });
};

exports.countAll = function (where = {}, trx = null) {
    return Models.LeadSubmissions.count({ where, transaction: trx });
};

exports.delete = function (where, trx = null) {
    return Models.LeadSubmissions.destroy({ where, transaction: trx });
};

module.exports = exports;
