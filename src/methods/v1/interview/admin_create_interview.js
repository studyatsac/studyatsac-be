const InterviewService = require('../../../services/v1/interview');
const InterviewTransformer = require('../../../transformers/v1/interview/interview');
const Language = require('../../../languages');
const LogUtils = require('../../../utils/logger');
const InterviewValidation = require('../../../validations/v1/interview/interview');

let lang;

exports.createInterview = async (req, res) => {
    try {
        lang = Language.getLanguage(req.locale);

        let input;
        try {
            input = await InterviewValidation(lang).validateAsync(req.body);
        } catch (err) {
            return res.status(400).json({ message: err.message });
        }

        const result = await InterviewService.createInterview(input, { lang });

        if (!result.status) {
            return res.status(result.code).json({ message: result.message });
        }

        return res.status(200).json({
            data: InterviewTransformer.interviewItem(result.data, false),
            message: lang.INTERVIEW.CREATE_SUCCESS
        });
    } catch (err) {
        LogUtils.logError({
            functionName: 'createInterview',
            message: err.message
        });

        return res.status(500).json({ message: lang.INTERNAL_SERVER_ERROR });
    }
};

module.exports = exports;
