const Joi = require('joi');

module.exports = function (lang) {
    return Joi.object().keys({
        email: Joi.string().lowercase().trim().email().required().error(new Error(lang.EMAIL_NOT_VALID))
    });
};
