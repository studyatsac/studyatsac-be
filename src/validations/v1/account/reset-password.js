const Joi = require('joi');

const ResetPasswordValidation = (lang) => {
    return Joi.object({
        token: Joi.string().required().messages({
            'any.required': lang.TOKEN_IS_REQUIRED
        }),
        newPassword: Joi.string().min(6).required().messages({
            'any.required': lang.PASSWORD_IS_REQUIRED,
            'string.min': lang.PASSWORD_TOO_SHORT
        })
    });
};

module.exports = ResetPasswordValidation;
