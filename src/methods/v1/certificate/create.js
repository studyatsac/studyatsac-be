const { v4: uuidv4 } = require('uuid');
const CertificateRepository = require('../../../repositories/mysql/certificate');
const UserRepository = require('../../../repositories/mysql/user');
const validateSchema = require('../../../validations/v1/certificate/create');
const Languages = require('../../../languages');
const logger = require('../../../utils/logger');

/**
 * Create a new certificate
 * POST /certificate
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with created certificate
 */
exports.createCertificate = async (req, res) => {
    try {
        const lang = Languages[req.locale] || Languages.id;

        // Validate request body
        const schema = validateSchema(lang);
        const { error, value } = schema.validate(req.body);

        if (error) {
            logger.logError('Certificate validation error:', error);
            return res.status(400).json({
                status: 'error',
                message: error.message
            });
        }

        // Normalize field names (convert snake_case to camelCase if present)
        const normalized = {
            userId: value.userId || value.user_id,
            certificateName: value.certificateName || value.certificate_name,
            certificateType: value.certificateType || value.certificate_type,
            certificateNumber: value.certificateNumber || value.certificate_number,
            issuedDate: value.issuedDate || value.issued_date,
            testDate: value.testDate || value.test_date,
            validUntil: value.validUntil || value.valid_until,
            listeningScore: value.listeningScore !== undefined ? value.listeningScore : value.listening_score,
            structureScore: value.structureScore !== undefined ? value.structureScore : value.structure_score,
            readingScore: value.readingScore !== undefined ? value.readingScore : value.reading_score,
            overallScore: value.overallScore !== undefined ? value.overallScore : value.overall_score,
            directorName: value.directorName || value.director_name,
            certificateUrl: value.certificateUrl || value.certificate_url,
            description: value.description
        };

        // Check if user exists
        const user = await UserRepository.findOne({ id: normalized.userId });
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        // Prepare certificate data
        const certificateData = {
            certificateId: uuidv4(),
            userId: normalized.userId,
            certificateName: normalized.certificateName,
            certificateType: normalized.certificateType || null,
            certificateNumber: normalized.certificateNumber || null,
            issuedDate: normalized.issuedDate,
            testDate: normalized.testDate || null,
            validUntil: normalized.validUntil || null,
            listeningScore: normalized.listeningScore || null,
            structureScore: normalized.structureScore || null,
            readingScore: normalized.readingScore || null,
            overallScore: normalized.overallScore || null,
            directorName: normalized.directorName || 'Riko Susiloputro',
            certificateUrl: normalized.certificateUrl || null,
            description: normalized.description || null
        };

        // Create certificate
        const certificate = await CertificateRepository.create(certificateData);

        // Fetch the created certificate with user info
        const createdCertificate = await CertificateRepository.findOneById(certificate.certificateId);

        logger.logDebug(`Certificate created: ${certificate.certificateId} for user: ${value.userId}`);

        return res.status(201).json({
            status: 'success',
            message: 'Certificate created successfully',
            data: createdCertificate
        });
    } catch (err) {
        logger.logError('Error creating certificate:', err);
        return res.status(500).json({
            status: 'error',
            message: err.message || 'Internal server error'
        });
    }
};

module.exports = exports;
