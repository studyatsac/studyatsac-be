const Joi = require('joi');

module.exports = function (lang) {
    return Joi.object().keys({
        oldPassword: Joi.string().required().error(new Error(lang.PASSWORD_NOT_VALID)),
        newPassword: Joi.string().required().error(new Error(lang.PASSWORD_NOT_VALID))
    });
};
