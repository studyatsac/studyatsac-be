const Joi = require('joi');

module.exports = function (lang) {
    return Joi.object().keys({
        id: Joi.number().positive().allow(null, '').default(1),
        score: Joi.number().required().error(new Error(lang.SCORE_NOT_VALID)),
        readingScore: Joi.number().allow(null, '').error(new Error(lang.SCORE_NOT_VALID)),
        listeningScore: Joi.number().allow(null, '').error(new Error(lang.SCORE_NOT_VALID)),
        nip: Joi.string().allow(null, '').error(new Error(lang.NIP_NOT_VALID)),
        faculty: Joi.string().allow(null, '').error(new Error(lang.FACULTY_NAME_NOT_VALID))
    });
};
