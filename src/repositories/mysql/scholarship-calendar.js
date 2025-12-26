const Models = require('../../models/mysql');

exports.create = async function (data, trx = null) {
    return Models.ScholarshipCalendar.create(data, { transaction: trx });
};

exports.findOne = function (where, opts = {}, trx = null) {
    return Models.ScholarshipCalendar.findOne({
        where,
        include: [{
            model: Models.Scholarships,
            as: 'scholarship',
            attributes: ['id', 'uuid', 'scholarship_name', 'open_date', 'closed_date', 'level', 'type', 'country', 'university'],
            include: [{
                model: Models.ScholarshipDetails,
                as: 'details',
                attributes: ['description', 'requirement', 'benefit']
            }]
        }],
        ...opts,
        transaction: trx
    });
};

exports.findAndCountAll = function (where, opts = {}, trx = null) {
    return Models.ScholarshipCalendar.findAndCountAll({
        where,
        include: [{
            model: Models.Scholarships,
            as: 'scholarship',
            attributes: ['id', 'uuid', 'scholarship_name', 'open_date', 'closed_date', 'level', 'type', 'country', 'university']
        }],
        ...opts,
        transaction: trx
    });
};

exports.findByMonth = function (month, year, filters = {}, opts = {}, trx = null) {
    const { Op } = require('sequelize');

    // Create date range for the specified month
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);

    const whereClause = {
        ...filters,
        start_date: {
            [Op.between]: [startOfMonth, endOfMonth]
        }
    };

    return Models.ScholarshipCalendar.findAll({
        where: whereClause,
        include: [{
            model: Models.Scholarships,
            as: 'scholarship',
            attributes: ['id', 'uuid', 'scholarship_name', 'open_date', 'closed_date', 'level', 'type', 'country', 'university']
        }],
        ...opts,
        transaction: trx
    });
};

exports.update = function (payload, where, trx = null) {
    return Models.ScholarshipCalendar.update(payload, { where, transaction: trx });
};

exports.delete = function (where, trx = null) {
    return Models.ScholarshipCalendar.destroy({ where, transaction: trx });
};

module.exports = exports;
