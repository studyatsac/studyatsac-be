const Joi = require('joi');
const UserInterviewSectionValidation = require('../user-interview/user_interview_section');
const InterviewSectionAnswerReviewValidation = require('./interview_section_answer_review');

module.exports = function (lang) {
    return Joi.object({
        uuid: UserInterviewSectionValidation(lang).extract('uuid'),
        interviewSectionAnswers: Joi.array().items(InterviewSectionAnswerReviewValidation(lang)).required().error(new Error(lang.USER_INTERVIEW_SECTION.INTERVIEW_SECTION_ANSWERS_NOT_VALID))
    });
};
