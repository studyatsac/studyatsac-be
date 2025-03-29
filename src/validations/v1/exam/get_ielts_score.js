const Joi = require('joi');

module.exports = function (lang) {
    return Joi.object().keys({
        id: Joi.number().positive().required(),
        limit: Joi.number().default(10).error(new Error(lang.LIMIT_NOT_VALID)),
        page: Joi.number().default(1).error(new Error(lang.PAGE_NOT_VALID))
    });
};
