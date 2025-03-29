const Joi = require('joi');

module.exports = function (lang) {
    return Joi.object().keys({
        fullName: Joi.string().trim().required().error(new Error(lang.FULL_NAME_NOT_VALID)),
        email: Joi.string().lowercase().trim().email().required().error(new Error(lang.EMAIL_NOT_VALID)),
        password: Joi.string().required().error(new Error(lang.PASSWORD_NOT_VALID))
    });
};
