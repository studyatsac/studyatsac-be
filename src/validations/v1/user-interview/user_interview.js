const Joi = require('joi');
const UserInterviewSectionValidation = require('./user_interview_section');

module.exports = function (lang) {
    return Joi.object({
        withReview: Joi.boolean().optional().error(new Error(lang.USER_INTERVIEW.WITH_REVIEW_NOT_VALID)),
        interviewUuid: Joi.string().guid({ version: 'uuidv4' }).required().error(new Error(lang.USER_INTERVIEW.INTERVIEW_UUID_NOT_VALID)),
        overallReview: Joi.string().max(20000).allow('', null).optional().error(new Error(lang.USER_INTERVIEW.OVERALL_REVIEW_NOT_VALID)),
        interviewSections: Joi.array().items(UserInterviewSectionValidation(lang)).required().error(new Error(lang.USER_INTERVIEW.INTERVIEW_SECTIONS_NOT_VALID)),
        backgroundDescription: Joi.string().max(40000).allow('', null).optional().error(new Error(lang.USER_INTERVIEW.BACKGROUND_DESCRIPTION_NOT_VALID)),
        language: Joi.string().valid(...Object.values(require('../../../constants/common').LANGUAGE)).optional().error(new Error(lang.USER_INTERVIEW.LANGUAGE_NOT_VALID))
    });
};
