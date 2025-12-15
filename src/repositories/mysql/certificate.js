const Models = require('../../models/mysql');

/**
 * Create a new certificate
 * @param {Object} payload - Certificate data
 * @param {Object} trx - Transaction object
 * @returns {Promise} Created certificate instance
 */
exports.create = function (payload, trx = null) {
    return Models.Certificate.create(payload, { transaction: trx });
};

/**
 * Find all certificates by user ID
 * @param {Number} userId - User ID
 * @param {Object} trx - Transaction object
 * @returns {Promise} Array of certificates
 */
exports.findAllByUserID = function (userId, trx = null) {
    return Models.Certificate.findAll({
        where: { user_id: userId },
        include: [
            {
                model: Models.User,
                as: 'user',
                attributes: ['id', 'uuid', 'full_name', 'email', 'photo_url', 'institution_name']
            }
        ],
        order: [['created_at', 'DESC']],
        transaction: trx
    });
};

/**
 * Find one certificate by certificate ID
 * @param {String} certificateId - Certificate UUID
 * @param {Object} trx - Transaction object
 * @returns {Promise} Certificate instance
 */
exports.findOneById = function (certificateId, trx = null) {
    return Models.Certificate.findOne({
        where: { certificate_id: certificateId },
        include: [
            {
                model: Models.User,
                as: 'user',
                attributes: ['id', 'uuid', 'full_name', 'email', 'photo_url', 'institution_name']
            }
        ],
        transaction: trx
    });
};

/**
 * Find and count all certificates (for pagination)
 * @param {Object} where - Where clause
 * @param {Object} opts - Additional options
 * @param {Object} trx - Transaction object
 * @returns {Promise} Object with rows and count
 */
exports.findAllAndCount = function (where, opts = {}, trx = null) {
    const queryOpts = { where, ...opts, transaction: trx };

    // Always include user information for admin list
    queryOpts.include = queryOpts.include || [];
    queryOpts.include.push({
        model: Models.User,
        as: 'user',
        attributes: ['id', 'uuid', 'full_name', 'email', 'photo_url', 'institution_name']
    });

    return Models.Certificate.findAndCountAll(queryOpts);
};

/**
 * Update certificate by criteria
 * @param {Object} where - Where clause
 * @param {Object} payload - Data to update
 * @param {Object} trx - Transaction object
 * @returns {Promise} Number of updated rows
 */
exports.update = function (where, payload, trx = null) {
    return Models.Certificate.update(payload, { where, transaction: trx });
};

/**
 * Delete certificate (soft delete)
 * @param {Object} where - Where clause
 * @param {Object} trx - Transaction object
 * @returns {Promise} Number of deleted rows
 */
exports.delete = function (where, trx = null) {
    return Models.Certificate.destroy({ where, transaction: trx });
};

/**
 * Find one certificate by criteria
 * @param {Object} where - Where clause
 * @param {Object} opts - Additional options
 * @param {Object} trx - Transaction object
 * @returns {Promise} Certificate instance
 */
exports.findOne = function (where, opts = {}, trx = null) {
    const queryOpts = { where, ...opts, transaction: trx };

    // Include user information if not explicitly disabled
    if (!opts.excludeUser) {
        queryOpts.include = queryOpts.include || [];
        queryOpts.include.push({
            model: Models.User,
            as: 'user',
            attributes: ['id', 'uuid', 'full_name', 'email', 'photo_url', 'institution_name']
        });
    }

    return Models.Certificate.findOne(queryOpts);
};

module.exports = exports;
