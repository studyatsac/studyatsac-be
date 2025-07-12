const Joi = require('joi');
const UserEssayValidation = require('../user-essay/user_essay');

module.exports = function (lang) {
    return UserEssayValidation(lang).keys({
        essayPackageUuid: Joi.string().guid({ version: 'uuidv4' }).required().error(new Error(lang.USER_ESSAY.ESSAY_PACKAGE_UUID_NOT_VALID))
    });
};
