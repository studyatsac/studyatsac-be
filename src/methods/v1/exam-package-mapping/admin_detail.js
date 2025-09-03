const ExamPackageMappingService = require('../../../services/v1/exam_package_mapping');

exports.getExamPackageMappingDetail = async (req, res) => {
    try {
        const { uuid } = req.params;

        const result = await ExamPackageMappingService.getExamPackageMappingDetail({
            uuid
        }, { lang: req.lang });

        if (!result.success) {
            return res.status(result.code).json({ message: result.message });
        }

        return res.status(result.code).json({ data: result.data });

    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};
module.exports = exports;
