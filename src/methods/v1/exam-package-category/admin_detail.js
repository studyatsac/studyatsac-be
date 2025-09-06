const ExamPackageCategoryService = require('../../../services/v1/exam_package_category');
const Language = require('../../../languages');

exports.getDetailExamPackageCategory = async (req, res) => {
    try {
        const { uuid } = req.params;

        const lang = Language.getLanguage(req.locale);

        const result = await ExamPackageCategoryService.getDetailExamPackageCategory({
            uuid
        }, { lang });

        if (!result.success) {
            return res.status(result.code).json({ message: result.message });
        }

        return res.status(result.code).json({ data: result.data });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = exports;
