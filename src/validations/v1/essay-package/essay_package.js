const Joi = require('joi');
const EssayPackageMappingValidation = require('./essay_package_mapping');
const ProductPackageValidation = require('../product-package/product_package');

module.exports = function (lang) {
    return ProductPackageValidation(lang, {
        titleNotValidMessage: lang.ESSAY_PACKAGE.TITLE_NOT_VALID,
        descriptionNotValidMessage: lang.ESSAY_PACKAGE.DESCRIPTION_NOT_VALID,
        additionalInformationNotValidMessage: lang.ESSAY_PACKAGE.ADDITIONAL_INFORMATION_NOT_VALID,
        priceNotValidMessage: lang.ESSAY_PACKAGE.PRICE_NOT_VALID,
        totalMaxAttemptNotValidMessage: lang.ESSAY_PACKAGE.TOTAL_MAX_ATTEMPT_NOT_VALID,
        defaultItemMaxAttemptNotValidMessage: lang.ESSAY_PACKAGE.DEFAULT_ITEM_MAX_ATTEMPT_NOT_VALID,
        paymentUrlNotValidMessage: lang.ESSAY_PACKAGE.PAYMENT_URL_NOT_VALID,
        isActiveNotValidMessage: lang.ESSAY_PACKAGE.IS_ACTIVE_NOT_VALID,
        externalProductIdNotValidMessage: lang.ESSAY_PACKAGE.EXTERNAL_PRODUCT_ID_NOT_VALID,
        externalProductNameNotValidMessage: lang.ESSAY_PACKAGE.EXTERNAL_PRODUCT_NAME_NOT_VALID,
        externalTicketIdNotValidMessage: lang.ESSAY_PACKAGE.EXTERNAL_TICKET_ID_NOT_VALID,
        externalTicketNameNotValidMessage: lang.ESSAY_PACKAGE.EXTERNAL_TICKET_NAME_NOT_VALID
    }).keys({
        essayPackageMappings: Joi.array().items(EssayPackageMappingValidation(lang)).optional().error(new Error(lang.ESSAY_PACKAGE.ESSAY_PACKAGE_MAPPINGS_NOT_VALID))
    });
};
