const Joi = require('joi');

module.exports = function (lang) {
    return Joi.object({
        certificateName: Joi.string().max(255).required()
            .error(new Error('Certificate name is required and must not exceed 255 characters')),
        certificateType: Joi.string().max(100).optional().allow('', null)
            .error(new Error('Certificate type must not exceed 100 characters')),
        certificateNumber: Joi.string().max(100).optional().allow('', null)
            .error(new Error('Certificate number must not exceed 100 characters')),
        issuedDate: Joi.date().required()
            .error(new Error('Issued date is required and must be a valid date')),
        testDate: Joi.date().optional().allow('', null)
            .error(new Error('Test date must be a valid date')),
        validUntil: Joi.date().optional().allow('', null)
            .error(new Error('Valid until must be a valid date')),
        listeningScore: Joi.number().integer().min(0).optional().allow(null)
            .error(new Error('Listening score must be a non-negative integer')),
        structureScore: Joi.number().integer().min(0).optional().allow(null)
            .error(new Error('Structure score must be a non-negative integer')),
        readingScore: Joi.number().integer().min(0).optional().allow(null)
            .error(new Error('Reading score must be a non-negative integer')),
        overallScore: Joi.number().integer().min(0).optional().allow(null)
            .error(new Error('Overall score must be a non-negative integer')),
        directorName: Joi.string().max(255).optional().allow('', null)
            .error(new Error('Director name must not exceed 255 characters')),
        certificateUrl: Joi.string().max(500).optional().allow('', null)
            .error(new Error('Certificate URL must not exceed 500 characters')),
        description: Joi.string().optional().allow('', null)
            .error(new Error('Description must be a valid string'))
    }).options({ convert: true }); // Enable automatic type conversion
};
