const Joi = require('joi');

module.exports = function (lang) {
    return Joi.object().keys({
        userExamUuid: Joi.string().guid({ version: 'uuidv4' }).allow(null, '').default(null).error(new Error(lang.USER_EXAM_UUID_NOT_VALID)),
        questionUuid: Joi.string().guid({ version: 'uuidv4' }).allow(null, '').default(null).error(new Error(lang.QUESTION_UUID_NOT_VALID)),
        answer: Joi.string().required().error(new Error(lang.EXAM_UUID_NOT_VALID))
    });
};
