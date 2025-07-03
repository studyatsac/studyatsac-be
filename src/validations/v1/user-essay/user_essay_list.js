const Joi = require('joi');
const ListValidation = require('../../custom/list');

module.exports = function (lang) {
    return ListValidation(lang).keys({
        essayUuid: Joi.string().guid({ version: 'uuidv4' }).optional().error(new Error(lang.USER_ESSAY.ESSAY_UUID_NOT_VALID))
    });
};
