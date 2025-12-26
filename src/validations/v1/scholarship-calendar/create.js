const Joi = require('joi');

module.exports = function (lang) {
    return Joi.object({
        scholarship_id: Joi.number().integer().positive().required()
            .error(new Error('Scholarship ID is required and must be a positive integer')),

        title: Joi.string().max(255).required()
            .error(new Error('Title is required and must not exceed 255 characters')),

        description: Joi.string().optional().allow('', null)
            .error(new Error('Description must be a valid string')),

        start_date: Joi.date().iso().required()
            .error(new Error('Start date is required and must be a valid ISO 8601 date')),

        end_date: Joi.date().iso().required()
            .error(new Error('End date is required and must be a valid ISO 8601 date')),

        registration_deadline: Joi.date().iso().optional().allow('', null)
            .error(new Error('Registration deadline must be a valid ISO 8601 date')),

        announcement_date: Joi.date().iso().optional().allow('', null)
            .error(new Error('Announcement date must be a valid ISO 8601 date')),

        event_type: Joi.string().valid('registration', 'deadline', 'announcement', 'interview', 'exam', 'other').optional()
            .error(new Error('Event type must be one of: registration, deadline, announcement, interview, exam, other')),

        location: Joi.string().max(255).optional().allow('', null)
            .error(new Error('Location must not exceed 255 characters')),

        is_online: Joi.boolean().optional()
            .error(new Error('is_online must be a boolean value')),

        url: Joi.string().uri().max(500).optional().allow('', null)
            .error(new Error('URL must be a valid URI and not exceed 500 characters')),

        status: Joi.string().valid('upcoming', 'ongoing', 'completed', 'cancelled').optional()
            .error(new Error('Status must be one of: upcoming, ongoing, completed, cancelled'))
    }).options({ convert: true });
};
