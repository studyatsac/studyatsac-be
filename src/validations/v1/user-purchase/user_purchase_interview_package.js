const Joi = require('joi');

module.exports = function (lang) {
    return Joi.object({
        interviewPackageUuid: Joi.string().guid({ version: 'uuidv4' }).required().error(new Error(lang.USER_PURCHASE.INTERVIEW_PACKAGE_UUID_NOT_VALID))
    });
};
