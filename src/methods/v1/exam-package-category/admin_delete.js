const ExamPackageCategoryService = require('../../../services/v1/exam_package_category');

exports.deleteExamPackageCategory = async (req, res) => {
    try {
        const { uuid } = req.params;

        const result = await ExamPackageCategoryService.deleteExamPackageCategory({
            uuid
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
