const ClaimFreeExamPackageValidation = require('../../../validations/v1/exam-package/claim_free_exam_package');
const ExamPackageService = require('../../../services/v1/exam_package');
const Language = require('../../../languages');
const LogUtils = require('../../../utils/logger');

let lang;

exports.postClaimFreeExamPackage = async (req, res) => {
    try {
        const { params } = req;

        lang = Language.getLanguage(req.locale);

        let input;

        try {
            input = await ClaimFreeExamPackageValidation(lang).validateAsync(params);
        } catch (err) {
            return res.status(400).json({ message: err.message });
        }

        input.user = req.session;

        const result = await ExamPackageService.claimFreeExamPackage(input, { lang });

        if (!result.status) {
            return res.status(result.code).json({ message: result.message });
        }

        return res.status(200).json({
            message: 'Success',
            data: null
        });
    } catch (err) {
        LogUtils.loggingError({
            function_name: 'postClaimFreeExamPackage',
            message: err.message
        });

        return res.status(500).json({ message: lang.INTERNAL_SERVER_ERROR });
    }
};

module.exports = exports;
