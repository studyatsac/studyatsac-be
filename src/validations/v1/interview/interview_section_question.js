const Joi = require('joi');

module.exports = function (lang) {
    return Joi.object({
        uuid: Joi.string().guid({ version: 'uuidv4' }).optional().error(new Error(lang.INTERVIEW_SECTION_QUESTION.UUID_NOT_VALID)),
        number: Joi.number().allow(null).optional().error(new Error(lang.INTERVIEW_SECTION_QUESTION.NUMBER_NOT_VALID)),
        question: Joi.string().max(1000).required().error(new Error(lang.INTERVIEW_SECTION_QUESTION.QUESTION_NOT_VALID)),
        systemPrompt: Joi.string().allow('', null).max(30000).optional().error(new Error(lang.INTERVIEW_SECTION_QUESTION.SYSTEM_PROMPT_NOT_VALID)),
        hint: Joi.string().allow('', null).max(5000).optional().error(new Error(lang.INTERVIEW_SECTION_QUESTION.HINT_NOT_VALID))
    });
};
