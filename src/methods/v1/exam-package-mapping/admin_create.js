const Language = require('../../../languages');
const ExamPackageMappingService = require('../../../services/v1/exam_package_mapping');

exports.createExamPackageMapping = async (req, res) => {
    try {
        const { examPackageId, examId } = req.body;

        const lang = Language.getLanguage(req.locale);

        const result = await ExamPackageMappingService.createExamPackageMapping({
            examPackageId,
            examId
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
