const Joi = require('joi');

module.exports = function (lang) {
    return Joi.object().keys({
        search: Joi.string().max(30).allow(null, '').error(new Error(lang.SEARCH_NOT_VALID)),
        limit: Joi.number().default(10).error(new Error(lang.LIMIT_NOT_VALID)),
        page: Joi.number().default(1).error(new Error(lang.PAGE_NOT_VALID))
    });
};
