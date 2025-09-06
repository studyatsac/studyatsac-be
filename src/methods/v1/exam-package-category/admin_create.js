const ExamPackageCategoryService = require('../../../services/v1/exam_package_category');
exports.createExamPackageCategory = async (req, res) => {
    try {
        const { examPackageId, masterCategoryId } = req.body;

        const result = await ExamPackageCategoryService.createExamPackageCategory({
            examPackageId,
            masterCategoryId
        }, { lang: req.lang });

        return res.status(result.code).json(Response.format(result));
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = exports;
