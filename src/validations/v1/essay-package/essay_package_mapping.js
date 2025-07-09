const Joi = require('joi');

module.exports = function (lang) {
    return Joi.object({
        uuid: Joi.string().guid({ version: 'uuidv4' }).optional().error(new Error(lang.ESSAY_PACKAGE_MAPPING.UUID_NOT_VALID)),
        essayUuid: Joi.string().guid({ version: 'uuidv4' }).required().error(new Error(lang.ESSAY_PACKAGE_MAPPING.ESSAY_UUID_NOT_VALID)),
        maxAttempt: Joi.number().min(0).required().error(new Error(lang.ESSAY_PACKAGE_MAPPING.MAX_ATTEMPT_NOT_VALID))
    });
};
