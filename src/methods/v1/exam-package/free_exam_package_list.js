const ExamPackageService = require('../../../services/v1/exam_package');
const FreeExamPackageTransformer = require('../../../transformers/v1/exam-package/list_free_exam_package');
const Language = require('../../../languages');
const LogUtils = require('../../../utils/logger');

let lang;

exports.getListFreeExamPackage = async (req, res) => {
    try {
        lang = Language.getLanguage(req.locale);

        const input = {
            user: req.session
        };

        const result = await ExamPackageService.getListFreeExamPackage(input, { lang });

        if (!result.status) {
            return res.status(result.code).json({ message: result.message });
        }

        const data = result.data || {};
        const rows = data.rows || [];

        return res.status(200).json({
            data: rows.map(FreeExamPackageTransformer.item)
        });
    } catch (err) {
        LogUtils.loggingError({
            function_name: 'getListFreeExamPackage',
            message: err.message
        });

        return res.status(500).json({ message: lang.INTERNAL_SERVER_ERROR });
    }
};

module.exports = exports;
