const Joi = require('joi');

module.exports = (lang) => {
    return Joi.object({
        email: Joi.string().email().required().messages({
            'string.base': lang.EMAIL_INVALID,
            'string.email': lang.EMAIL_INVALID,
            'any.required': lang.EMAIL_REQUIRED
        })
    });
};