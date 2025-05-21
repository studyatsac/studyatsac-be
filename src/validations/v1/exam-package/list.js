const Joi = require('joi');

const ListValidation = require('../../custom/list');

module.exports = function (lang) {
    return ListValidation(lang).keys({
        excludePurchased: Joi.boolean().default(false).error(new Error(lang.SEARCH_NOT_VALID)),
        categoryUuid: Joi.string().guid({ version: 'uuidv4' }).allow(null, '').default(null).error(new Error(lang.UUID_NOT_VALID)),
        order: Joi.string().valid('asc', 'desc').default('desc')
    }).unknown(true);
};
