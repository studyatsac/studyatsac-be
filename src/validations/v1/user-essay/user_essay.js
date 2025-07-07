const Joi = require('joi');
const UserEssayItemValidation = require('./user_essay_item');

module.exports = function (lang) {
    return Joi.object({
        withReview: Joi.boolean().optional().error(new Error(lang.USER_ESSAY.WITH_REVIEW_NOT_VALID)),
        essayUuid: Joi.string().guid({ version: 'uuidv4' }).required().error(new Error(lang.USER_ESSAY.ESSAY_UUID_NOT_VALID)),
        overallReview: Joi.string().max(1000).allow('', null).optional().error(new Error(lang.USER_ESSAY.OVERALL_REVIEW_NOT_VALID)),
        essayItems: Joi.array().items(UserEssayItemValidation(lang)).required().error(new Error(lang.USER_ESSAY.ESSAY_ITEMS_NOT_VALID))
    });
};
