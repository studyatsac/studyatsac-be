const Joi = require('joi');
const InterviewSectionValidation = require('./interview_section');

module.exports = function (lang) {
    return Joi.object({
        title: Joi.string().max(200).required().error(new Error(lang.INTERVIEW.TITLE_NOT_VALID)),
        description: Joi.string().max(5000).required().error(new Error(lang.INTERVIEW.DESCRIPTION_NOT_VALID)),
        isActive: Joi.boolean().optional().default(true).error(new Error(lang.INTERVIEW.IS_ACTIVE_NOT_VALID)),
        interviewSections: Joi.array().items(InterviewSectionValidation(lang)).optional().error(new Error(lang.INTERVIEW.INTERVIEW_SECTIONS_NOT_VALID))
    });
};
