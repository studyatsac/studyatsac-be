const ExamPackageCategoryService = require('../../../services/v1/exam_package_category');
const Language = require('../../../languages');

exports.updateExamPackageCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { examPackageId, masterCategoryId } = req.body;

        const lang = Language.getLanguage(req.locale);

        const result = await ExamPackageCategoryService.updateExamPackageCategory({
            uuid: id,
            examPackageId,
            masterCategoryId
        }, { lang });

        if (!result.success) {
            return res.status(result.code)
                .json({ message: result.message });
        }

        return res.status(result.code)
            .json({ data: result.data });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = exports;
