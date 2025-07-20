const Joi = require('joi');

module.exports = function (lang) {
    return Joi.object({
        userUuid: Joi.string().guid({ version: 'uuidv4' }).required().error(new Error(lang.USER_PURCHASE.USER_UUID_NOT_VALID)),
        examPackageUuid: Joi.string().guid({ version: 'uuidv4' }).optional().error(new Error(lang.USER_PURCHASE.EXAM_PACKAGE_UUID_NOT_VALID)),
        essayPackageUuid: Joi.string().guid({ version: 'uuidv4' }).optional().error(new Error(lang.USER_PURCHASE.ESSAY_PACKAGE_UUID_NOT_VALID)),
        interviewPackageUuid: Joi.string().guid({ version: 'uuidv4' }).optional().error(new Error(lang.USER_PURCHASE.INTERVIEW_PACKAGE_UUID_NOT_VALID)),
        externalTransactionId: Joi.string().max(45).allow('', null).optional().error(new Error(lang.USER_PURCHASE.EXTERNAL_TRANSACTION_ID_NOT_VALID)),
        expiredAt: Joi.date().allow('', null).optional().error(new Error(lang.USER_PURCHASE.EXPIRED_AT_NOT_VALID))
    });
};
