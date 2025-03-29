const Joi = require('joi');

module.exports = function (lang) {
    return Joi.object().keys({
        uuid: Joi.string().guid({ version: 'uuidv4' }).default(null).error(new Error(lang.UUID_NOT_VALID))
    });
};
