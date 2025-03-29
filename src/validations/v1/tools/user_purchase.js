const Joi = require('joi');

module.exports = function (lang) {
    return Joi.object().keys({
        email: Joi.string().lowercase().trim().email().required().error(new Error(lang.EMAIL_NOT_VALID)),
        examPackageUuid: Joi.string().guid({ version: 'uuidv4' }).required().error(new Error(lang.UUID_NOT_VALID)),
        expiredIn: Joi.number().positive().allow(null, '').default(365).error(new Error(lang.EXPIRED_DAY_NOT_VALID))
    });
};
