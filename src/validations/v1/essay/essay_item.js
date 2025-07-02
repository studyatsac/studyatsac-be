const Joi = require('joi');

module.exports = function (lang) {
    return Joi.object.keys({
        number: Joi.number().required().error(new Error(lang.ESSAY_ITEM.NUMBER_NOT_VALID)),
        topic: Joi.string().max(100).required().error(new Error(lang.ESSAY_ITEM.TOPIC_NOT_VALID)),
        description: Joi.string().max(1000).required().error(new Error(lang.ESSAY_ITEM.DESCRIPTION_NOT_VALID)),
        systemPrompt: Joi.string().max(1000).required().error(new Error(lang.ESSAY_ITEM.SYSTEM_PROMPT_NOT_VALID))
    });
};
