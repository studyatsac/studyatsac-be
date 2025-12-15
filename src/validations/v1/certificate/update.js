const Joi = require('joi');

module.exports = function (lang) {
    return Joi.object({
        userId: Joi.number().integer().positive().optional()
            .error(new Error('User ID must be a positive integer')),
        certificateName: Joi.string().max(255).optional()
            .error(new Error('Certificate name must not exceed 255 characters')),
        certificateType: Joi.string().max(100).optional().allow('', null)
            .error(new Error('Certificate type must not exceed 100 characters')),
        certificateNumber: Joi.string().max(100).optional().allow('', null)
            .error(new Error('Certificate number must not exceed 100 characters')),
        issuedDate: Joi.date().optional()
            .error(new Error('Issued date must be a valid date')),
        testDate: Joi.date().optional().allow('', null)
            .error(new Error('Test date must be a valid date')),
        validUntil: Joi.date().optional().allow('', null)
            .error(new Error('Valid until must be a valid date')),
        listeningScore: Joi.number().integer().min(0).max(100).optional().allow(null)
            .error(new Error('Listening score must be an integer between 0 and 100')),
        structureScore: Joi.number().integer().min(0).max(100).optional().allow(null)
            .error(new Error('Structure score must be an integer between 0 and 100')),
        readingScore: Joi.number().integer().min(0).max(100).optional().allow(null)
            .error(new Error('Reading score must be an integer between 0 and 100')),
        overallScore: Joi.number().integer().min(0).max(100).optional().allow(null)
            .error(new Error('Overall score must be an integer between 0 and 100')),
        directorName: Joi.string().max(255).optional().allow('', null)
            .error(new Error('Director name must not exceed 255 characters')),
        certificateUrl: Joi.string().uri().max(500).optional().allow('', null)
            .error(new Error('Certificate URL must be a valid URI and not exceed 500 characters')),
        description: Joi.string().optional().allow('', null)
            .error(new Error('Description must be a valid string'))
    });
};
