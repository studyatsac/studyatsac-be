const Language = require('../../../languages');
const ExamPackageMappingService = require('../../../services/v1/exam_package_mapping');

exports.updateExamPackageMapping = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            examPackageId,
            examId
        } = req.body;

        const lang = Language.getLanguage(req.locale);

        const result = await ExamPackageMappingService.updateExamPackageMapping({
            uuid: id,
            examPackageId,
            examId
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
