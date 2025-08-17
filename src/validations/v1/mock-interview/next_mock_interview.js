const Joi = require('joi');
const InitMockInterviewValidation = require('./init_mock_interview');

module.exports = function (lang) {
    return Joi.object({
        interviewSections: InitMockInterviewValidation(lang).extract('interviewSections')
    });
};
