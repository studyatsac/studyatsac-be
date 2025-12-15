const CertificateRepository = require('../../../repositories/mysql/certificate');
const logger = require('../../../utils/logger');

/**
 * Get all certificates by user ID
 * GET /certificate/:userid
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with array of certificates
 */
exports.getAllCertificatesByUserId = async (req, res) => {
    try {
        const { userid } = req.params;
        const sessionUserId = req.session && req.session.id;

        // Authorization check: User can only access their own certificates
        // Admin check is done via middleware, so if user reaches here, they either:
        // 1. Are viewing their own certificates
        // 2. Have admin privileges
        if (parseInt(userid, 10) !== sessionUserId) {
            // Check if user is admin via role
            const RoleUserRepository = require('../../../repositories/mysql/role_users');
            const isAdmin = await RoleUserRepository.userHasRole(sessionUserId, 'admin');

            if (!isAdmin) {
                return res.status(403).json({
                    status: 'error',
                    message: 'Forbidden: You can only access your own certificates'
                });
            }
        }

        // Get all certificates for the user
        const certificates = await CertificateRepository.findAllByUserID(parseInt(userid, 10));

        logger.info(`Retrieved ${certificates.length} certificates for user: ${userid}`);

        return res.status(200).json({
            status: 'success',
            data: certificates
        });
    } catch (err) {
        logger.error('Error fetching certificates by user ID:', err);
        return res.status(500).json({
            status: 'error',
            message: err.message || 'Internal server error'
        });
    }
};

module.exports = exports;
