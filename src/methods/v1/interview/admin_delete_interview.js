const InterviewService = require('../../../services/v1/interview');
const Language = require('../../../languages');
const LogUtils = require('../../../utils/logger');

let lang;

exports.deleteInterview = async (req, res) => {
    try {
        lang = Language.getLanguage(req.locale);

        const { uuid } = req.params;
        const result = await InterviewService.deleteInterview({ uuid }, { lang });

        if (!result.status) {
            return res.status(result.code).json({ message: result.message });
        }

        return res.status(200).json({ message: lang.INTERVIEW.DELETE_SUCCESS });
    } catch (err) {
        LogUtils.logError({
            functionName: 'deleteInterview',
            message: err.message
        });

        return res.status(500).json({ message: lang.INTERNAL_SERVER_ERROR });
    }
};

module.exports = exports;
