const Joi = require('joi');

module.exports = function (lang) {
    return Joi.object().keys({
        examUuid: Joi.string().guid({ version: 'uuidv4' }).allow(null, '').default(null).error(new Error(lang.EXAM_UUID_NOT_VALID)),
        userExamUuid: Joi.string().guid({ version: 'uuidv4' }).allow(null, '').default(null).error(new Error(lang.EXAM_UUID_NOT_VALID))
    });
};
