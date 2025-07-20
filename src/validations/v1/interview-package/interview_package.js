const Joi = require('joi');
const InterviewPackageMappingValidation = require('./interview_package_mapping');
const ProductPackageValidation = require('../product-package/product_package');

module.exports = function (lang) {
    return ProductPackageValidation(lang, {
        titleNotValidMessage: lang.INTERVIEW_PACKAGE.TITLE_NOT_VALID,
        descriptionNotValidMessage: lang.INTERVIEW_PACKAGE.DESCRIPTION_NOT_VALID,
        additionalInformationNotValidMessage: lang.INTERVIEW_PACKAGE.ADDITIONAL_INFORMATION_NOT_VALID,
        priceNotValidMessage: lang.INTERVIEW_PACKAGE.PRICE_NOT_VALID,
        totalMaxAttemptNotValidMessage: lang.INTERVIEW_PACKAGE.TOTAL_MAX_ATTEMPT_NOT_VALID,
        defaultItemMaxAttemptNotValidMessage: lang.INTERVIEW_PACKAGE.DEFAULT_ITEM_MAX_ATTEMPT_NOT_VALID,
        paymentUrlNotValidMessage: lang.INTERVIEW_PACKAGE.PAYMENT_URL_NOT_VALID,
        isActiveNotValidMessage: lang.INTERVIEW_PACKAGE.IS_ACTIVE_NOT_VALID,
        externalProductIdNotValidMessage: lang.INTERVIEW_PACKAGE.EXTERNAL_PRODUCT_ID_NOT_VALID,
        externalProductNameNotValidMessage: lang.INTERVIEW_PACKAGE.EXTERNAL_PRODUCT_NAME_NOT_VALID,
        externalTicketIdNotValidMessage: lang.INTERVIEW_PACKAGE.EXTERNAL_TICKET_ID_NOT_VALID,
        externalTicketNameNotValidMessage: lang.INTERVIEW_PACKAGE.EXTERNAL_TICKET_NAME_NOT_VALID
    }).keys({
        interviewPackageMappings: Joi.array().items(InterviewPackageMappingValidation(lang)).optional().error(new Error(lang.INTERVIEW_PACKAGE.INTERVIEW_PACKAGE_MAPPINGS_NOT_VALID))
    });
};
