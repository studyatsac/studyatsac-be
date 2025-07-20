const InterviewPackageService = require('../../../services/v1/interview_package');
const Language = require('../../../languages');
const LogUtils = require('../../../utils/logger');

let lang;

exports.deleteInterviewPackage = async (req, res) => {
    try {
        lang = Language.getLanguage(req.locale);

        const { uuid } = req.params;
        const result = await InterviewPackageService.deleteInterviewPackage({ uuid }, { lang });

        if (!result.status) {
            return res.status(result.code).json({ message: result.message });
        }

        return res.status(200).json({ message: lang.INTERVIEW_PACKAGE.DELETE_SUCCESS });
    } catch (err) {
        LogUtils.loggingError({
            functionName: 'deleteInterviewPackage',
            message: err.message
        });

        return res.status(500).json({ message: lang.INTERNAL_SERVER_ERROR });
    }
};

module.exports = exports;
