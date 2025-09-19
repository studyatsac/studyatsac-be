const ExamPackageMappingService = require('../../../services/v1/exam_package_mapping');
const Language = require('../../../languages');

exports.getExamPackageMappingDetail = async (req, res) => {
    try {
        const { uuid } = req.params;

        const lang = Language.getLanguage(req.locale);

        const result = await ExamPackageMappingService.getExamPackageMappingDetail({
            uuid
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
