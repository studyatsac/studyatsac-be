const CertificateRepository = require('../../../repositories/mysql/certificate');
const logger = require('../../../utils/logger');

/**
 * Delete certificate by certificate ID (Admin only)
 * DELETE /admin/certificate/delete/:certificate_id
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with success message
 */
exports.deleteCertificate = async (req, res) => {
    try {
        const { certificate_id } = req.params;

        // Check if certificate exists
        const certificate = await CertificateRepository.findOneById(certificate_id);
        if (!certificate) {
            return res.status(404).json({
                status: 'error',
                message: 'Certificate not found'
            });
        }

        // Delete certificate (soft delete)
        await CertificateRepository.delete({ certificate_id });

        logger.info(`Certificate deleted: ${certificate_id}`);

        return res.status(200).json({
            status: 'success',
            message: 'Certificate deleted successfully'
        });
    } catch (err) {
        logger.error('Error deleting certificate:', err);
        return res.status(500).json({
            status: 'error',
            message: err.message || 'Internal server error'
        });
    }
};

module.exports = exports;
