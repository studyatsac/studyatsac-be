const InterviewService = require('../../../services/v1/interview');
const InterviewTransformer = require('../../../transformers/v1/interview/interview');
const Language = require('../../../languages');
const LogUtils = require('../../../utils/logger');

let lang;

exports.getInterview = async (req, res) => {
    try {
        lang = Language.getLanguage(req.locale);

        const { uuid } = req.params;
        const result = await InterviewService.getInterview({ uuid }, { lang, isDetailed: true });

        if (!result.status) {
            return res.status(result.code).json({ message: result.message });
        }

        return res.status(200).json({ data: InterviewTransformer.interviewItem(result.data, false), message: '' });
    } catch (err) {
        LogUtils.loggingError({
            functionName: 'getInterview',
            message: err.message
        });

        return res.status(500).json({ message: lang.INTERNAL_SERVER_ERROR });
    }
};

module.exports = exports;
