const { Op } = require('sequelize');
const CertificateRepository = require('../../../repositories/mysql/certificate');
const logger = require('../../../utils/logger');

/**
 * Get list of all certificates with pagination and search (Admin only)
 * GET /admin/certificate/list
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with paginated certificates
 */
exports.getListCertificates = async (req, res) => {
    try {
        // Get pagination parameters
        const {
            page = 1, limit = 10, search, order = 'desc', orderBy = 'created_at'
        } = req.query;
        const pageInt = parseInt(page, 10) || 1;
        const limitInt = parseInt(limit, 10) || 10;
        const offset = (pageInt - 1) * limitInt;

        // Build where clause for search
        const whereClause = {};
        if (search) {
            whereClause[Op.or] = [
                { certificate_name: { [Op.like]: `%${search}%` } },
                { certificate_number: { [Op.like]: `%${search}%` } },
                { certificate_type: { [Op.like]: `%${search}%` } },
                { '$user.full_name$': { [Op.like]: `%${search}%` } },
                { '$user.email$': { [Op.like]: `%${search}%` } }
            ];
        }

        // Query certificates with pagination
        const { rows, count } = await CertificateRepository.findAllAndCount(
            whereClause,
            {
                offset,
                limit: limitInt,
                order: [[orderBy, order.toUpperCase()]],
                distinct: true
            }
        );

        logger.info(`Retrieved ${rows.length} certificates (page ${pageInt}, total: ${count})`);

        return res.status(200).json({
            status: 'success',
            data: rows,
            meta: {
                page: pageInt,
                limit: limitInt,
                total_data: count,
                total_page: Math.ceil(count / limitInt)
            }
        });
    } catch (err) {
        logger.error('Error fetching certificates list:', err);
        return res.status(500).json({
            status: 'error',
            message: err.message || 'Internal server error'
        });
    }
};

module.exports = exports;
