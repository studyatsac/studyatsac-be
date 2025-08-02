const Joi = require('joi');
const UserInterviewValidation = require('../user-interview/user_interview');
const InitMockInterviewSectionValidation = require('./init_mock_interview_section');

module.exports = function (lang) {
    const userInterviewValidation = UserInterviewValidation(lang);

    return Joi.object({
        interviewUuid: userInterviewValidation.extract('interviewUuid'),
        backgroundDescription: userInterviewValidation.extract('backgroundDescription'),
        language: userInterviewValidation.extract('language'),
        interviewPackageUuid: Joi.string().guid({ version: 'uuidv4' }).required().error(new Error(lang.USER_INTERVIEW.INTERVIEW_PACKAGE_UUID_NOT_VALID)),
        interviewSections: Joi.array().items(InitMockInterviewSectionValidation(lang)).required().error(new Error(lang.USER_INTERVIEW.INTERVIEW_SECTIONS_NOT_VALID))
    });
};
