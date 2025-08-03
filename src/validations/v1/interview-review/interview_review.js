const Joi = require('joi');
const InterviewSectionReviewValidation = require('./interview_section_review');

module.exports = function (lang) {
    return Joi.object({
        interviewSections: Joi.array().items(InterviewSectionReviewValidation(lang)).required().error(new Error(lang.USER_INTERVIEW.INTERVIEW_SECTIONS_NOT_VALID))
    });
};
