const { Op } = require('sequelize');
const Models = require('../../models/mysql');

/**
 * Find all popups with filters
 * @param {Object} filters - Filter criteria
 * @param {Object} opts - Additional options (limit, offset, order)
 * @param {Object} trx - Transaction object
 * @returns {Promise<Array>}
 */
exports.findAll = function (filters = {}, opts = {}, trx = null) {
    const where = {};

    if (filters.status !== undefined) {
        where.status = filters.status;
    }

    if (filters.search) {
        where.title = { [Op.like]: `%${filters.search}%` };
    }

    return Models.Popup.findAll({
        where,
        ...opts,
        transaction: trx
    });
};

/**
 * Find and count all popups with filters
 * @param {Object} filters - Filter criteria
 * @param {Object} opts - Additional options (limit, offset, order)
 * @param {Object} trx - Transaction object
 * @returns {Promise<Object>} { rows, count }
 */
exports.findAndCountAll = function (filters = {}, opts = {}, trx = null) {
    const where = {};

    if (filters.status !== undefined) {
        where.status = filters.status;
    }

    if (filters.search) {
        where.title = { [Op.like]: `%${filters.search}%` };
    }

    return Models.Popup.findAndCountAll({
        where,
        ...opts,
        transaction: trx
    });
};

/**
 * Find one popup by criteria
 * @param {Object} criteria - Where clause criteria
 * @param {Object} opts - Additional options
 * @param {Object} trx - Transaction object
 * @returns {Promise<Object|null>}
 */
exports.findOne = function (criteria, opts = {}, trx = null) {
    return Models.Popup.findOne({
        where: criteria,
        ...opts,
        transaction: trx
    });
};

/**
 * Find active popup with highest priority
 * Business logic: returns popup that is:
 * - status = 1 (active)
 * - start_date <= NOW() or start_date is NULL
 * - end_date >= NOW() or end_date is NULL
 * Sorted by priority DESC, created_at DESC
 * @param {Object} trx - Transaction object
 * @returns {Promise<Object|null>}
 */
exports.findActivePopup = function (trx = null) {
    const now = new Date();

    return Models.Popup.findOne({
        where: {
            status: 1,
            [Op.and]: [
                {
                    [Op.or]: [
                        { start_date: null },
                        { start_date: { [Op.lte]: now } }
                    ]
                },
                {
                    [Op.or]: [
                        { end_date: null },
                        { end_date: { [Op.gte]: now } }
                    ]
                }
            ]
        },
        order: [
            ['priority', 'DESC'],
            ['created_at', 'DESC']
        ],
        transaction: trx
    });
};

/**
 * Create new popup
 * @param {Object} data - Popup data
 * @param {Object} trx - Transaction object
 * @returns {Promise<Object>}
 */
exports.create = function (data, trx = null) {
    return Models.Popup.create(data, { transaction: trx });
};

/**
 * Update popup by UUID
 * @param {Object} payload - Data to update
 * @param {Object} where - Where clause
 * @param {Object} trx - Transaction object
 * @returns {Promise<Array>} [number of affected rows]
 */
exports.update = function (payload, where, trx = null) {
    return Models.Popup.update(payload, { where, transaction: trx });
};

/**
 * Delete popup (soft delete)
 * @param {Object} where - Where clause
 * @param {Object} trx - Transaction object
 * @returns {Promise<number>}
 */
exports.delete = function (where, trx = null) {
    return Models.Popup.destroy({ where, transaction: trx });
};

/**
 * Count popups matching filters
 * @param {Object} filters - Filter criteria
 * @param {Object} trx - Transaction object
 * @returns {Promise<number>}
 */
exports.count = function (filters = {}, trx = null) {
    const where = {};

    if (filters.status !== undefined) {
        where.status = filters.status;
    }

    if (filters.search) {
        where.title = { [Op.like]: `%${filters.search}%` };
    }

    return Models.Popup.count({ where, transaction: trx });
};

module.exports = exports;
