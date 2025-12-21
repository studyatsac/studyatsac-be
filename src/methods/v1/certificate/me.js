const CertificateRepository = require('../../../repositories/mysql/certificate');
const logger = require('../../../utils/logger');

/**
 * Get all certificates for the currently authenticated user
 * GET /certificate/me
 * GET /certificate/me?page=1&limit=10
 *
 * This endpoint retrieves certificates directly from the authenticated user's session,
 * eliminating the need to expose user IDs in the frontend.
 *
 * Supports optional pagination via query parameters:
 * - page: Page number (default: 1)
 * - limit: Number of items per page (default: returns all)
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with array of user's certificates
 */
exports.getMyCertificates = async (req, res) => {
    try {
        // Get user ID from session (set by tokenMiddleware)
        const userId = req.session && req.session.id;

        if (!userId) {
            return res.status(401).json({
                status: 'error',
                message: 'User not authenticated'
            });
        }

        // Parse pagination parameters
        const page = parseInt(req.query.page, 10) || null;
        const limit = parseInt(req.query.limit, 10) || null;

        // Validate pagination parameters
        if (page !== null && page < 1) {
            return res.status(400).json({
                status: 'error',
                message: 'Page number must be greater than 0'
            });
        }

        if (limit !== null && (limit < 1 || limit > 100)) {
            return res.status(400).json({
                status: 'error',
                message: 'Limit must be between 1 and 100'
            });
        }

        // Get all certificates for the authenticated user
        const allCertificates = await CertificateRepository.findAllByUserID(userId);
        const totalCertificates = allCertificates.length;

        // Apply pagination if parameters are provided
        let certificates = allCertificates;
        let paginationMeta = null;

        if (page !== null && limit !== null) {
            const offset = (page - 1) * limit;
            certificates = allCertificates.slice(offset, offset + limit);

            paginationMeta = {
                page,
                limit,
                total: totalCertificates,
                totalPages: Math.ceil(totalCertificates / limit),
                hasNextPage: page < Math.ceil(totalCertificates / limit),
                hasPreviousPage: page > 1
            };
        }

        logger.logDebug(`Retrieved ${certificates.length}/${totalCertificates} certificates for authenticated user: ${userId}${paginationMeta ? ` (page ${page})` : ''}`);

        // Build response
        const response = {
            status: 'success',
            data: certificates
        };

        // Add pagination metadata if pagination was used
        if (paginationMeta) {
            response.pagination = paginationMeta;
        }

        return res.status(200).json(response);
    } catch (err) {
        logger.logError('Error fetching user certificates:', err);
        return res.status(500).json({
            status: 'error',
            message: err.message || 'Internal server error'
        });
    }
};

module.exports = exports;
