const InterviewPackageService = require('../../../services/v1/interview_package');
const InterviewPackageTransformer = require('../../../transformers/v1/interview-package/interview_package');
const Language = require('../../../languages');
const LogUtils = require('../../../utils/logger');
const InterviewPackageValidation = require('../../../validations/v1/interview-package/interview_package');

let lang;

exports.createInterviewPackage = async (req, res) => {
    try {
        lang = Language.getLanguage(req.locale);

        let input;
        try {
            input = await InterviewPackageValidation(lang).validateAsync(req.body);
        } catch (err) {
            return res.status(400).json({ message: err.message });
        }

        const result = await InterviewPackageService.createInterviewPackage(input, { lang });

        if (!result.status) {
            return res.status(result.code).json({ message: result.message });
        }

        return res.status(200).json({
            data: InterviewPackageTransformer.interviewPackageItem(result.data, false),
            message: lang.INTERVIEW_PACKAGE.CREATE_SUCCESS
        });
    } catch (err) {
        LogUtils.logError({
            functionName: 'createInterviewPackage',
            message: err.message
        });

        return res.status(500).json({ message: lang.INTERNAL_SERVER_ERROR });
    }
};

module.exports = exports;
