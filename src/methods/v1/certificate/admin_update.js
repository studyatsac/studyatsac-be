const CertificateRepository = require('../../../repositories/mysql/certificate');
const UserRepository = require('../../../repositories/mysql/user');
const validateSchema = require('../../../validations/v1/certificate/update');
const Languages = require('../../../languages');
const logger = require('../../../utils/logger');

/**
 * Update certificate by certificate ID (Admin only)
 * PUT /admin/certificate/:certificate_id
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with updated certificate
 */
exports.updateCertificate = async (req, res) => {
    try {
        const { certificate_id } = req.params;
        const lang = Languages[req.locale] || Languages.id;

        // Check if certificate exists
        const existingCertificate = await CertificateRepository.findOneById(certificate_id);
        if (!existingCertificate) {
            return res.status(404).json({
                status: 'error',
                message: 'Certificate not found'
            });
        }

        // Validate request body
        const schema = validateSchema(lang);
        const { error, value } = schema.validate(req.body);

        if (error) {
            logger.error('Certificate update validation error:', error);
            return res.status(400).json({
                status: 'error',
                message: error.message
            });
        }

        // If userId is being changed, verify the new user exists
        if (value.userId && value.userId !== existingCertificate.userId) {
            const user = await UserRepository.findOne({ id: value.userId });
            if (!user) {
                return res.status(404).json({
                    status: 'error',
                    message: 'User not found'
                });
            }
        }

        // Prepare update data (only include fields that were provided)
        const updateData = {};
        if (value.userId !== undefined) updateData.userId = value.userId;
        if (value.certificateName !== undefined) updateData.certificateName = value.certificateName;
        if (value.certificateType !== undefined) updateData.certificateType = value.certificateType;
        if (value.certificateNumber !== undefined) updateData.certificateNumber = value.certificateNumber;
        if (value.issuedDate !== undefined) updateData.issuedDate = value.issuedDate;
        if (value.testDate !== undefined) updateData.testDate = value.testDate;
        if (value.validUntil !== undefined) updateData.validUntil = value.validUntil;
        if (value.listeningScore !== undefined) updateData.listeningScore = value.listeningScore;
        if (value.structureScore !== undefined) updateData.structureScore = value.structureScore;
        if (value.readingScore !== undefined) updateData.readingScore = value.readingScore;
        if (value.overallScore !== undefined) updateData.overallScore = value.overallScore;
        if (value.directorName !== undefined) updateData.directorName = value.directorName;
        if (value.certificateUrl !== undefined) updateData.certificateUrl = value.certificateUrl;
        if (value.description !== undefined) updateData.description = value.description;

        // Update certificate
        await CertificateRepository.update(
            { certificate_id },
            updateData
        );

        // Fetch updated certificate
        const updatedCertificate = await CertificateRepository.findOneById(certificate_id);

        logger.info(`Certificate updated: ${certificate_id}`);

        return res.status(200).json({
            status: 'success',
            message: 'Certificate updated successfully',
            data: updatedCertificate
        });
    } catch (err) {
        logger.error('Error updating certificate:', err);
        return res.status(500).json({
            status: 'error',
            message: err.message || 'Internal server error'
        });
    }
};

module.exports = exports;
