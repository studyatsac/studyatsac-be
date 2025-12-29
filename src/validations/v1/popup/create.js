```javascript
const Joi = require('joi');

module.exports = function (lang) {
    return Joi.object({
        title: Joi.string().max(255).required()
            .error(new Error('Title is required and must not exceed 255 characters')),

        description: Joi.string().optional().allow('', null)
            .error(new Error('Description must be a valid string')),

        image_url: Joi.string().max(500).uri().optional().allow('', null)
            .error(new Error('Image URL must be a valid URL and not exceed 500 characters')),

        link_url: Joi.string().uri().max(500).required()
            .error(new Error('Link URL is required, must be a valid URL, and not exceed 500 characters')),

        start_date: Joi.date().optional().allow(null)
            .error(new Error('Start date must be a valid date')),

        end_date: Joi.date().optional().allow(null).when('start_date', {
            is: Joi.date().required(),
            then: Joi.date().min(Joi.ref('start_date')),
            otherwise: Joi.date()
        })
            .error(new Error('End date must be a valid date and must be greater than or equal to start date')),

        priority: Joi.number().integer().min(0).optional().default(0)
            .error(new Error('Priority must be a non-negative integer')),

        status: Joi.number().integer().valid(0, 1).optional().default(1)
            .error(new Error('Status must be either 0 (inactive) or 1 (active)'))
    }).options({ convert: true });
};
