const Joi = require('joi');
const UserInterviewSectionAnswerValidation = require('./user_interview_section_answer');

module.exports = function (lang) {
    return Joi.object({
        uuid: Joi.string().guid({ version: 'uuidv4' }).optional().error(new Error(lang.USER_INTERVIEW_SECTION.UUID_NOT_VALID)),
        interviewSectionUuid: Joi.string().guid({ version: 'uuidv4' }).required().error(new Error(lang.USER_INTERVIEW_SECTION.INTERVIEW_SECTION_UUID_NOT_VALID)),
        interviewSectionAnswers: Joi.array().items(UserInterviewSectionAnswerValidation(lang)).required().error(new Error(lang.USER_INTERVIEW.INTERVIEW_SECTION_ANSWERS_NOT_VALID)),
        review: Joi.string().max(40000).allow('', null).optional().error(new Error(lang.USER_INTERVIEW_SECTION.REVIEW_NOT_VALID))
    });
};
