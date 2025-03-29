const Joi = require('joi');

const ListValidation = require('../../custom/list');

module.exports = function (lang) {
    return ListValidation(lang).keys({
        examUuid: Joi.string().guid({ version: 'uuidv4' }).required().default(null).error(new Error(lang.EXAM_UUID_NOT_VALID))
    });
};
