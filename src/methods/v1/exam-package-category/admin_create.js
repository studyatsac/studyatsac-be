const ExamPackageCategoryService = require('../../../services/v1/exam_package_category');

exports.createExamPackageCategory = async (req, res) => {
    try {
        const { examPackageId, masterCategoryId } = req.body;

        const result = await ExamPackageCategoryService.createExamPackageCategory({
            examPackageId,
            masterCategoryId
        }, { lang: req.lang });

        if (!result.status) {
            return res.status(result.code).json({ message: result.message });
        }

        return res.status(result.code).json({ code: result.code, message: result.message, data: result.data });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = exports;
