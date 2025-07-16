const InterviewService = require('../../../services/v1/interview');
const InterviewTransformer = require('../../../transformers/v1/interview/interview');
const Language = require('../../../languages');
const LogUtils = require('../../../utils/logger');

let lang;

exports.getRestrictedInterview = async (req, res) => {
    try {
        lang = Language.getLanguage(req.locale);

        const { uuid } = req.params;
        const result = await InterviewService.getInterview({ uuid, isActive: true }, { lang });

        if (!result.status) {
            return res.status(result.code).json({ message: result.message });
        }

        return res.status(200).json({ data: InterviewTransformer.interviewItem(result.data), message: '' });
    } catch (err) {
        LogUtils.loggingError({
            functionName: 'getRestrictedInterview',
            message: err.message
        });

        return res.status(500).json({ message: lang.INTERNAL_SERVER_ERROR });
    }
};

module.exports = exports;
