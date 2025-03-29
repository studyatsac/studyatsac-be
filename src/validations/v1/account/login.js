const Joi = require('joi');

module.exports = function (lang) {
    return Joi.object().keys({
        email: Joi.string().trim().email().required().error(new Error(lang.EMAIL_NOT_VALID)),
        password: Joi.string().required().error(new Error(lang.PASSWORD_NOT_VALID))
    });
};
