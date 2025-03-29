const Joi = require('joi');

module.exports = function (lang) {
    return Joi.object().keys({
        id: Joi.number().positive().allow(null, '').default(1),
        tasks: Joi.array().items(Joi.object().keys({
            type: Joi.string().valid('task-1', 'task-2').required(),
            text: Joi.string().required()
        }))
    });
};
