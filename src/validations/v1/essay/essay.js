const Joi = require('joi');
const EssayItemValidation = require('./essay_item');

module.exports = function (lang) {
    return Joi.object({
        title: Joi.string().max(200).required().error(new Error(lang.ESSAY.TITLE_NOT_VALID)),
        description: Joi.string().max(5000).required().error(new Error(lang.ESSAY.DESCRIPTION_NOT_VALID)),
        isActive: Joi.boolean().optional().default(true).error(new Error(lang.ESSAY.IS_ACTIVE_NOT_VALID)),
        essayItems: Joi.array().items(EssayItemValidation(lang)).optional().error(new Error(lang.ESSAY.ESSAY_ITEMS_NOT_VALID))
    });
};
