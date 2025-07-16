const Joi = require('joi');
const ListValidation = require('../../custom/list');

module.exports = function (lang) {
    return ListValidation(lang).keys({
        interviewUuid: Joi.string().guid({ version: 'uuidv4' }).optional().error(new Error(lang.USER_INTERVIEW.INTERVIEW_UUID_NOT_VALID))
    });
};
