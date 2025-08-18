const Joi = require('joi');
const UserInterviewSectionValidation = require('../user-interview/user_interview_section');

module.exports = function (lang) {
    const userInterviewSectionValidation = UserInterviewSectionValidation(lang);

    return Joi.object({
        interviewSectionUuid: userInterviewSectionValidation.extract('interviewSectionUuid'),
        language: userInterviewSectionValidation.extract('language')
    });
};
