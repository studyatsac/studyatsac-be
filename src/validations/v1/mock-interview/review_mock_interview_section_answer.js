const Joi = require('joi');
const UserInterviewSectionAnswerValidation = require('../user-interview/user_interview_section_answer');

module.exports = function (lang) {
    return Joi.object({
        uuid: UserInterviewSectionAnswerValidation(lang).extract('uuid'),
        answer: UserInterviewSectionAnswerValidation(lang).extract('answer')
    });
};
