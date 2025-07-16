const Joi = require('joi');

module.exports = function (lang) {
    return Joi.object({
        uuid: Joi.string().guid({ version: 'uuidv4' }).optional().error(new Error(lang.USER_INTERVIEW_SECTION_ANSWER.UUID_NOT_VALID)),
        interviewSectionQuestionUuid: Joi.string().guid({ version: 'uuidv4' }).required().error(new Error(lang.USER_INTERVIEW_SECTION_ANSWER.INTERVIEW_SECTION_QUESTION_UUID_NOT_VALID)),
        answer: Joi.string().max(40000).allow('', null).optional().error(new Error(lang.USER_INTERVIEW_SECTION_ANSWER.ANSWER_NOT_VALID)),
        review: Joi.string().max(40000).allow('', null).optional().error(new Error(lang.USER_INTERVIEW_SECTION_ANSWER.REVIEW_NOT_VALID))
    });
};
