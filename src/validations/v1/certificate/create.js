const Joi = require('joi');

module.exports = function (lang) {
    return Joi.object({
        // Accept both certificateName and certificate_name
        certificateName: Joi.string().max(255).required()
            .error(new Error('Certificate name is required and must not exceed 255 characters')),
        certificate_name: Joi.string().max(255)
            .error(new Error('Certificate name is required and must not exceed 255 characters')),

        // Accept both certificateType and certificate_type
        certificateType: Joi.string().max(100).optional().allow('', null)
            .error(new Error('Certificate type must not exceed 100 characters')),
        certificate_type: Joi.string().max(100).optional().allow('', null)
            .error(new Error('Certificate type must not exceed 100 characters')),

        // Accept both certificateNumber and certificate_number
        certificateNumber: Joi.string().max(100).optional().allow('', null)
            .error(new Error('Certificate number must not exceed 100 characters')),
        certificate_number: Joi.string().max(100).optional().allow('', null)
            .error(new Error('Certificate number must not exceed 100 characters')),

        // Accept both issuedDate and issued_date
        issuedDate: Joi.date().required()
            .error(new Error('Issued date is required and must be a valid date')),
        issued_date: Joi.date()
            .error(new Error('Issued date is required and must be a valid date')),

        // Accept both testDate and test_date
        testDate: Joi.date().optional().allow('', null)
            .error(new Error('Test date must be a valid date')),
        test_date: Joi.date().optional().allow('', null)
            .error(new Error('Test date must be a valid date')),

        // Accept both validUntil and valid_until
        validUntil: Joi.date().optional().allow('', null)
            .error(new Error('Valid until must be a valid date')),
        valid_until: Joi.date().optional().allow('', null)
            .error(new Error('Valid until must be a valid date')),

        // Accept both listeningScore and listening_score
        listeningScore: Joi.number().integer().min(0).optional().allow(null)
            .error(new Error('Listening score must be a non-negative integer')),
        listening_score: Joi.number().integer().min(0).optional().allow(null)
            .error(new Error('Listening score must be a non-negative integer')),

        // Accept both structureScore and structure_score
        structureScore: Joi.number().integer().min(0).optional().allow(null)
            .error(new Error('Structure score must be a non-negative integer')),
        structure_score: Joi.number().integer().min(0).optional().allow(null)
            .error(new Error('Structure score must be a non-negative integer')),

        // Accept both readingScore and reading_score
        readingScore: Joi.number().integer().min(0).optional().allow(null)
            .error(new Error('Reading score must be a non-negative integer')),
        reading_score: Joi.number().integer().min(0).optional().allow(null)
            .error(new Error('Reading score must be a non-negative integer')),

        // Accept both overallScore and overall_score
        overallScore: Joi.number().integer().min(0).optional().allow(null)
            .error(new Error('Overall score must be a non-negative integer')),
        overall_score: Joi.number().integer().min(0).optional().allow(null)
            .error(new Error('Overall score must be a non-negative integer')),

        // Accept both directorName and director_name
        directorName: Joi.string().max(255).optional().allow('', null)
            .error(new Error('Director name must not exceed 255 characters')),
        director_name: Joi.string().max(255).optional().allow('', null)
            .error(new Error('Director name must not exceed 255 characters')),

        // Accept both certificateUrl and certificate_url
        certificateUrl: Joi.string().max(500).optional().allow('', null)
            .error(new Error('Certificate URL must not exceed 500 characters')),
        certificate_url: Joi.string().max(500).optional().allow('', null)
            .error(new Error('Certificate URL must not exceed 500 characters')),

        description: Joi.string().optional().allow('', null)
            .error(new Error('Description must be a valid string'))
    })
        .oxor('userId', 'user_id') // Exactly one must be present
        .oxor('certificateName', 'certificate_name') // Exactly one must be present
        .oxor('issuedDate', 'issued_date') // Exactly one must be present
        .options({ convert: true }); // Enable automatic type conversion
};
