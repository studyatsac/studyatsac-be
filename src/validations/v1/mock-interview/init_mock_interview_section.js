const Joi = require('joi');
const UserInterviewSectionValidation = require('../user-interview/user_interview_section');

module.exports = function (lang) {
    return Joi.object({
        interviewSectionUuid: UserInterviewSectionValidation(lang).extract('interviewSectionUuid')
    });
};
