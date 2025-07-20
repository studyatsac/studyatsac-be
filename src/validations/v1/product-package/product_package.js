const Joi = require('joi');
const ProductPackageMappingValidation = require('./product_package_mapping');

module.exports = function (lang, opts = {}) {
    return Joi.object({
        title: Joi.string().max(200).required().error(
            new Error(opts.titleNotValidMessage ?? lang.PRODUCT_PACKAGE.TITLE_NOT_VALID)
        ),
        description: Joi.string().max(1000).required().error(
            new Error(opts.descriptionNotValidMessage ?? lang.PRODUCT_PACKAGE.DESCRIPTION_NOT_VALID)
        ),
        additionalInformation: Joi.string().max(10000).allow('', null).optional().error(
            new Error(opts.additionalInformationNotValidMessage ?? lang.PRODUCT_PACKAGE.ADDITIONAL_INFORMATION_NOT_VALID)
        ),
        price: Joi.number().min(0).optional().error(
            new Error(opts.priceNotValidMessage ?? lang.PRODUCT_PACKAGE.PRICE_NOT_VALID)
        ),
        totalMaxAttempt: Joi.number().min(0).optional().error(
            new Error(opts.totalMaxAttemptNotValidMessage ?? lang.PRODUCT_PACKAGE.TOTAL_MAX_ATTEMPT_NOT_VALID)
        ),
        defaultItemMaxAttempt: Joi.number().min(0).optional().error(
            new Error(opts.defaultItemMaxAttemptNotValidMessage ?? lang.PRODUCT_PACKAGE.DEFAULT_ITEM_MAX_ATTEMPT_NOT_VALID)
        ),
        paymentUrl: Joi.string().max(200).allow('', null).optional().error(
            new Error(opts.paymentUrlNotValidMessage ?? lang.PRODUCT_PACKAGE.PAYMENT_URL_NOT_VALID)
        ),
        isActive: Joi.boolean().optional().default(true).error(
            new Error(opts.isActiveNotValidMessage ?? lang.PRODUCT_PACKAGE.IS_ACTIVE_NOT_VALID)
        ),
        productPackageMappings: Joi.array().items(ProductPackageMappingValidation(lang)).optional().error(
            new Error(opts.productPackageMappingsNotValidMessage ?? lang.PRODUCT_PACKAGE.PRODUCT_PACKAGE_MAPPINGS_NOT_VALID)
        ),
        externalProductId: Joi.string().max(45).allow('', null).optional().error(
            new Error(opts.externalProductIdNotValidMessage ?? lang.PRODUCT_PACKAGE.EXTERNAL_PRODUCT_ID_NOT_VALID)
        ),
        externalProductName: Joi.string().max(200).allow('', null).optional().error(
            new Error(opts.externalProductNameNotValidMessage ?? lang.PRODUCT_PACKAGE.EXTERNAL_PRODUCT_NAME_NOT_VALID)
        ),
        externalTicketId: Joi.string().max(45).allow('', null).optional().error(
            new Error(opts.externalTicketIdNotValidMessage ?? lang.PRODUCT_PACKAGE.EXTERNAL_TICKET_ID_NOT_VALID)
        ),
        externalTicketName: Joi.string().max(200).allow('', null).optional().error(
            new Error(opts.externalTicketNameNotValidMessage ?? lang.PRODUCT_PACKAGE.EXTERNAL_TICKET_NAME_NOT_VALID)
        )
    });
};
