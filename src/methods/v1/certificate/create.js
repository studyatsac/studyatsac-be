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
            logger.error('Certificate validation error:', error);
            return res.status(400).json({
                status: 'error',
                message: error.message
            });
        }

        // Check if user exists
        const user = await UserRepository.findOne({ id: value.userId });
        if (!user) {
            return res.status(404).json({
                status: 'error',
                message: 'User not found'
            });
        }

        // Prepare certificate data
        const certificateData = {
            certificateId: uuidv4(),
            userId: value.userId,
            certificateName: value.certificateName,
            certificateType: value.certificateType || null,
            certificateNumber: value.certificateNumber || null,
            issuedDate: value.issuedDate,
            testDate: value.testDate || null,
            validUntil: value.validUntil || null,
            listeningScore: value.listeningScore || null,
            structureScore: value.structureScore || null,
            readingScore: value.readingScore || null,
            overallScore: value.overallScore || null,
            directorName: value.directorName || 'Riko Susiloputro',
            certificateUrl: value.certificateUrl || null,
            description: value.description || null
        };

        // Create certificate
        const certificate = await CertificateRepository.create(certificateData);

        // Fetch the created certificate with user info
        const createdCertificate = await CertificateRepository.findOneById(certificate.certificateId);

        logger.info(`Certificate created: ${certificate.certificateId} for user: ${value.userId}`);

        return res.status(201).json({
            status: 'success',
            message: 'Certificate created successfully',
            data: createdCertificate
        });
    } catch (err) {
        logger.error('Error creating certificate:', err);
        return res.status(500).json({
            status: 'error',
            message: err.message || 'Internal server error'
        });
    }
};

module.exports = exports;
