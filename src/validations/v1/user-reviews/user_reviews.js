const Joi = require('joi');

module.exports = function (lang) {
    return Joi.object({
        uuid: Joi.string().guid({ version: 'uuidv4' }).optional().error(new Error(lang.USER_ESSAY_ITEM.UUID_NOT_VALID)),
        userId: Joi.number().integer().min(1).required().error(new Error(lang.USER_REVIEW.USER_ID_NOT_VALID)),
        rating: Joi.number().integer().min(1).max(5).required().error(new Error(lang.USER_REVIEW.RATING_NOT_VALID)),
        comment: Joi.string().max(40000).allow('', null).optional().error(new Error(lang.USER_REVIEW.COMMENT_NOT_VALID))
    });
};
