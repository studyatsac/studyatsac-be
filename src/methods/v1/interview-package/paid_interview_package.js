const InterviewPackageService = require('../../../services/v1/interview_package');
const InterviewPackageTransformer = require('../../../transformers/v1/interview-package/interview_package');
const Language = require('../../../languages');
const LogUtils = require('../../../utils/logger');

let lang;

exports.getPaidInterviewPackage = async (req, res) => {
    try {
        lang = Language.getLanguage(req.locale);

        const { uuid } = req.params;
        const userId = req.session.id;
        const result = await InterviewPackageService.getPaidInterviewPackage({ uuid, userId }, { lang });

        if (!result.status) {
            return res.status(result.code).json({ message: result.message });
        }

        return res.status(200).json({ data: InterviewPackageTransformer.interviewPackageItem(result.data, false), message: '' });
    } catch (err) {
        LogUtils.logError({
            functionName: 'getPaidInterviewPackage',
            message: err.message
        });

        return res.status(500).json({ message: lang.INTERNAL_SERVER_ERROR });
    }
};

module.exports = exports;
