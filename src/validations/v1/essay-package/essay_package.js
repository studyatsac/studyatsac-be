const Joi = require('joi');
const EssayPackageMappingValidation = require('./essay_package_mapping');

module.exports = function (lang) {
    return Joi.object({
        title: Joi.string().max(100).required().error(new Error(lang.ESSAY_PACKAGE.TITLE_NOT_VALID)),
        description: Joi.string().max(1000).required().error(new Error(lang.ESSAY_PACKAGE.DESCRIPTION_NOT_VALID)),
        additionalInformation: Joi.string().max(5000).allow('', null).optional().error(new Error(lang.ESSAY_PACKAGE.ADDITIONAL_INFORMATION_NOT_VALID)),
        price: Joi.number().min(0).optional().error(new Error(lang.ESSAY_PACKAGE.PRICE_NOT_VALID)),
        totalMaxAttempt: Joi.number().min(0).optional().error(new Error(lang.ESSAY_PACKAGE.TOTAL_MAX_ATTEMPT_NOT_VALID)),
        defaultItemMaxAttempt: Joi.number().min(0).optional().error(new Error(lang.ESSAY_PACKAGE.DEFAULT_ITEM_MAX_ATTEMPT_NOT_VALID)),
        paymentUrl: Joi.string().max(200).optional().error(new Error(lang.ESSAY_PACKAGE.PAYMENT_URL_NOT_VALID)),
        isActive: Joi.boolean().optional().default(true).error(new Error(lang.ESSAY_PACKAGE.IS_ACTIVE_NOT_VALID)),
        essayPackageMappings: Joi.array().items(EssayPackageMappingValidation(lang)).optional().error(new Error(lang.ESSAY_PACKAGE.ESSAY_PACKAGE_MAPPINGS_NOT_VALID)),
        externalProductId: Joi.string().max(45).optional().error(new Error(lang.ESSAY_PACKAGE.EXTERNAL_PRODUCT_ID_NOT_VALID)),
        externalProductName: Joi.string().max(200).optional().error(new Error(lang.ESSAY_PACKAGE.EXTERNAL_PRODUCT_NAME_NOT_VALID)),
        externalTicketId: Joi.string().max(45).optional().error(new Error(lang.ESSAY_PACKAGE.EXTERNAL_TICKET_ID_NOT_VALID)),
        externalTicketName: Joi.string().max(200).optional().error(new Error(lang.ESSAY_PACKAGE.EXTERNAL_TICKET_NAME_NOT_VALID))
    });
};
