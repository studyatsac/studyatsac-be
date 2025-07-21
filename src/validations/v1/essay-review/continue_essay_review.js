const Joi = require('joi');
const UserEssayValidation = require('../user-essay/user_essay');

module.exports = function (lang) {
    return Joi.object({
        essayItems: UserEssayValidation(lang).extract('essayItems')
    });
};
