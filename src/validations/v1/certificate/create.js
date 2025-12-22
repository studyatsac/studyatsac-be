const Joi = require('joi');

module.exports = function (lang) {
    return Joi.object({
        user_id: Joi.number().integer().positive().required()
            .error(new Error('User ID is required and must be a positive integer')),

        exam_id: Joi.number().integer().positive().required()
            .error(new Error('Exam ID is required and must be a positive integer')),

        certificate_type: Joi.string().max(100).optional().allow('', null)
            .error(new Error('Certificate type must not exceed 100 characters')),

        certificate_number: Joi.string().max(100).optional().allow('', null)
            .error(new Error('Certificate number must not exceed 100 characters')),

        issued_date: Joi.date().required()
            .error(new Error('Issued date is required and must be a valid date')),

        test_date: Joi.date().optional().allow('', null)
            .error(new Error('Test date must be a valid date')),

        valid_until: Joi.date().optional().allow('', null)
            .error(new Error('Valid until must be a valid date')),

        listening_score: Joi.number().integer().min(0).optional().allow(null)
            .error(new Error('Listening score must be a non-negative integer')),

        structure_score: Joi.number().integer().min(0).optional().allow(null)
            .error(new Error('Structure score must be a non-negative integer')),

        reading_score: Joi.number().integer().min(0).optional().allow(null)
            .error(new Error('Reading score must be a non-negative integer')),

        overall_score: Joi.number().integer().min(0).optional().allow(null)
            .error(new Error('Overall score must be a non-negative integer')),

        director_name: Joi.string().max(255).optional().allow('', null)
            .error(new Error('Director name must not exceed 255 characters')),

        certificate_url: Joi.string().max(500).optional().allow('', null)
            .error(new Error('Certificate URL must not exceed 500 characters')),

        description: Joi.string().optional().allow('', null)
            .error(new Error('Description must be a valid string'))
    }).options({ convert: true }); // Enable automatic type conversion
};
