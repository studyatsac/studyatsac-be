const CertificateRepository = require('../../../repositories/mysql/certificate');
const logger = require('../../../utils/logger');

/**
 * Get certificate detail by certificate ID
 * GET /certificate/user/:certificate_id (User endpoint)
 * GET /admin/certificate/:certificate_id (Admin endpoint)
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with certificate detail
 */
exports.getDetailCertificateById = async (req, res) => {
    try {
        const { certificate_id } = req.params;
        const sessionUserId = req.session && req.session.id;

        // Find certificate
        const certificate = await CertificateRepository.findOneById(certificate_id);

        if (!certificate) {
            return res.status(404).json({
                status: 'error',
                message: 'Certificate not found'
            });
        }

        // Authorization check for user endpoint (not admin)
        // If the route is /certificate/user/:certificate_id, check ownership
        if (req.route.path.includes('/certificate/user/')) {
            if (certificate.userId !== sessionUserId) {
                // Check if user is admin
                const RoleUserRepository = require('../../../repositories/mysql/role_users');
                const isAdmin = await RoleUserRepository.userHasRole(sessionUserId, 'admin');

                if (!isAdmin) {
                    return res.status(403).json({
                        status: 'error',
                        message: 'Forbidden: You can only access your own certificates'
                    });
                }
            }
        }

        logger.info(`Retrieved certificate: ${certificate_id}`);

        return res.status(200).json({
            status: 'success',
            data: certificate
        });
    } catch (err) {
        logger.error('Error fetching certificate detail:', err);
        return res.status(500).json({
            status: 'error',
            message: err.message || 'Internal server error'
        });
    }
};

module.exports = exports;
