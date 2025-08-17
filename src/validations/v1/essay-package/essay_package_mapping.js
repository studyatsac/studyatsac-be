const Joi = require('joi');
const ProductPackageMappingValidation = require('../product-package/product_package_mapping');

module.exports = function (lang) {
    return ProductPackageMappingValidation(lang, {
        uuidNotValidMessage: lang.ESSAY_PACKAGE_MAPPING.UUID_NOT_VALID,
        maxAttemptNotValidMessage: lang.ESSAY_PACKAGE_MAPPING.MAX_ATTEMPT_NOT_VALID
    }).keys({
        essayUuid: Joi.string().guid({ version: 'uuidv4' }).required().error(new Error(lang.ESSAY_PACKAGE_MAPPING.ESSAY_UUID_NOT_VALID))
    });
};
