const Joi = require('joi');
const ProductPackageMappingValidation = require('../product-package/product_package_mapping');

module.exports = function (lang) {
    return ProductPackageMappingValidation(lang, {
        uuidNotValidMessage: lang.INTERVIEW_PACKAGE_MAPPING.UUID_NOT_VALID,
        maxAttemptNotValidMessage: lang.INTERVIEW_PACKAGE_MAPPING.MAX_ATTEMPT_NOT_VALID
    }).keys({
        interviewUuid: Joi.string().guid({ version: 'uuidv4' }).required().error(new Error(lang.INTERVIEW_PACKAGE_MAPPING.INTERVIEW_UUID_NOT_VALID))
    });
};
