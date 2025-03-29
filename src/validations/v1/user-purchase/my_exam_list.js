const Joi = require('joi');

module.exports = function (lang) {
    return Joi.object().keys({
        examPackageUuid: Joi.string().guid({ version: 'uuidv4' }).allow(null, '').default(null).error(new Error(lang.UUID_NOT_VALID)),
        categoryUuid: Joi.string().guid({ version: 'uuidv4' }).allow(null, '').default(null).error(new Error(lang.UUID_NOT_VALID))
    });
};
