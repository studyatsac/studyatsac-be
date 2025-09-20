const ExamPackageCategoryService = require('../../../services/v1/exam_package_category');
const Language = require('../../../languages');

exports.updateExamPackageCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { examPackageId, masterCategoryId } = req.body;

        const lang = Language.getLanguage(req.locale);

        const result = await ExamPackageCategoryService.updateExamPackageCategory({
            id,
            examPackageId,
            masterCategoryId
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
