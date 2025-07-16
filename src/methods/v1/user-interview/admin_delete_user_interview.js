const UserInterviewService = require('../../../services/v1/user_interview');
const Language = require('../../../languages');
const LogUtils = require('../../../utils/logger');

let lang;

exports.deleteUserInterview = async (req, res) => {
    try {
        lang = Language.getLanguage(req.locale);

        const { uuid } = req.params;
        const result = await UserInterviewService.deleteUserInterview({ uuid }, { lang });

        if (!result.status) {
            return res.status(result.code).json({ message: result.message });
        }

        return res.status(200).json({ message: lang.USER_INTERVIEW.DELETE_SUCCESS });
    } catch (err) {
        LogUtils.loggingError({
            functionName: 'deleteUserInterview',
            message: err.message
        });

        return res.status(500).json({ message: lang.INTERNAL_SERVER_ERROR });
    }
};

module.exports = exports;
