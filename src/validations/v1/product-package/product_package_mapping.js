const Joi = require('joi');

module.exports = function (lang, opts = {}) {
    return Joi.object({
        uuid: Joi.string().guid({ version: 'uuidv4' }).optional().error(
            new Error(opts.uuidNotValidMessage ?? lang.ESSAY_PACKAGE_MAPPING.UUID_NOT_VALID)
        ),
        maxAttempt: Joi.number().min(0).required().error(
            new Error(opts.maxAttemptNotValidMessage ?? lang.ESSAY_PACKAGE_MAPPING.MAX_ATTEMPT_NOT_VALID)
        )
    });
};
