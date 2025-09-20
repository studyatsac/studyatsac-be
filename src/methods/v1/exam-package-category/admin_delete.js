const ExamPackageCategoryService = require('../../../services/v1/exam_package_category');
const Language = require('../../../languages');

exports.deleteExamPackageCategory = async (req, res) => {
    try {
        const { id } = req.params;

        const lang = Language.getLanguage(req.locale);

        const result = await ExamPackageCategoryService.deleteExamPackageCategory({
            id
        }, { lang });

        if (!result.status) {
            return res.status(result.code).json({ message: result.message });
        }

        return res.status(result.code).json({ code: result.code, message: result.message, data: result.data });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = exports;
