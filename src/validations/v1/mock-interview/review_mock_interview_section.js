const Joi = require('joi');
const UserInterviewSectionValidation = require('../user-interview/user_interview_section');
const ReviewMockInterviewSectionAnswerValidation = require('./review_mock_interview_section_answer');

module.exports = function (lang) {
    return Joi.object({
        uuid: UserInterviewSectionValidation(lang).extract('uuid'),
        interviewSectionAnswers: Joi.array().items(ReviewMockInterviewSectionAnswerValidation(lang)).required().error(new Error(lang.USER_INTERVIEW_SECTION.INTERVIEW_SECTION_ANSWERS_NOT_VALID))
    });
};
