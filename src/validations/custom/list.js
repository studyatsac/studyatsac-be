const Joi = require('joi');

module.exports = function (lang) {
    return Joi.object().keys({
        search: Joi.string().max(30).allow(null, '').error(new Error(lang.SEARCH_NOT_VALID)),
        limit: Joi.number().default(10).error(new Error(lang.LIMIT_NOT_VALID)),
        page: Joi.number().default(1).error(new Error(lang.PAGE_NOT_VALID)),
        orderBy: Joi.string().valid('id', 'created_at', 'updated_at').default('created_at').error(new Error(lang.ORDER_BY_NOT_VALID)),
        order: Joi.string().valid('asc', 'desc').default('desc').error(new Error(lang.ORDER_NOT_VALID))
    });
};
