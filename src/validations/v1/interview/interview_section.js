const Joi = require('joi');
const InterviewSectionQuestionValidation = require('./interview_section_question');

module.exports = function (lang) {
    return Joi.object({
        uuid: Joi.string().guid({ version: 'uuidv4' }).optional().error(new Error(lang.INTERVIEW_SECTION.UUID_NOT_VALID)),
        number: Joi.number().allow(null).optional().error(new Error(lang.INTERVIEW_SECTION.NUMBER_NOT_VALID)),
        title: Joi.string().max(200).required().error(new Error(lang.INTERVIEW_SECTION.TITLE_NOT_VALID)),
        description: Joi.string().max(5000).required().error(new Error(lang.INTERVIEW_SECTION.DESCRIPTION_NOT_VALID)),
        systemPrompt: Joi.string().max(30000).required().error(new Error(lang.INTERVIEW_SECTION.SYSTEM_PROMPT_NOT_VALID)),
        duration: Joi.number().min(0).optional().error(new Error(lang.INTERVIEW_SECTION.DURATION_NOT_VALID)),
        interviewSectionQuestions: Joi.array().items(InterviewSectionQuestionValidation(lang)).optional().error(new Error(lang.INTERVIEW_SECTION.INTERVIEW_SECTION_QUESTIONS_NOT_VALID))
    });
};
