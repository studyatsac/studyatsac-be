const UserInterviewService = require('../../../services/v1/user_interview');
const UserInterviewTransformer = require('../../../transformers/v1/user-interview/user_interview');
const Language = require('../../../languages');
const LogUtils = require('../../../utils/logger');

let lang;

exports.getDetailedUserInterview = async (req, res) => {
    try {
        lang = Language.getLanguage(req.locale);

        const { uuid } = req.params;
        const result = await UserInterviewService.getUserInterview(
            { uuid },
            { lang, isDetailed: true }
        );

        if (!result.status) {
            return res.status(result.code).json({ message: result.message });
        }

        return res.status(200).json({
            data: UserInterviewTransformer.userInterviewItem(result.data, false),
            message: ''
        });
    } catch (err) {
        LogUtils.loggingError({
            functionName: 'getDetailedUserInterview',
            message: err.message
        });

        return res.status(500).json({ message: lang.INTERNAL_SERVER_ERROR });
    }
};

module.exports = exports;
