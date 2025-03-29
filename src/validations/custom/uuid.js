const Joi = require('joi');

module.exports = function (lang) {
    return Joi.string().guid({ version: 'uuidv4' }).required().error(new Error(lang.UUID_NOT_VALID));
};
