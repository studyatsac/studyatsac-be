const Joi = require('joi');

module.exports = function (lang) {
    return Joi.object({
        uuid: Joi.string().guid({ version: 'uuidv4' }).optional().error(new Error(lang.USER_ESSAY_ITEM.UUID_NOT_VALID)),
        essayItemUuid: Joi.string().guid({ version: 'uuidv4' }).required().error(new Error(lang.USER_ESSAY_ITEM.ESSAY_ITEM_UUID_NOT_VALID)),
        answer: Joi.string().max(100).required().error(new Error(lang.USER_ESSAY_ITEM.ANSWER_NOT_VALID)),
        review: Joi.string().max(1000).allow('', null).optional().error(new Error(lang.USER_ESSAY_ITEM.REVIEW_NOT_VALID))
    });
};
