const Joi = require('joi');

module.exports = function (lang) {
    return Joi.object({
        whatsapp_number: Joi.string().min(10).max(20).required().error(new Error(lang.LEAD_SUBMISSIONS?.WHATSAPP_NUMBER_NOT_VALID || 'WhatsApp number is not valid')),
        selected_program: Joi.string().max(100).required().error(new Error(lang.LEAD_SUBMISSIONS?.SELECTED_PROGRAM_NOT_VALID || 'Selected program is not valid')),
        source: Joi.string().max(100).required().error(new Error(lang.LEAD_SUBMISSIONS?.SOURCE_NOT_VALID || 'Source is not valid'))
    });
};
