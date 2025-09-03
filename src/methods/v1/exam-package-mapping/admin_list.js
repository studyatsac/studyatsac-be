const ExamPackageMappingService = require('../../../services/v1/exam_package_mapping');

exports.getListExamPackageMapping = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, orderBy, order, examPackageId, categoryId } = req.query;

        // Validasi input
        const pageInt = parseInt(page, 10) || 1;
        const limitInt = parseInt(limit, 10) || 10;

        if (!examPackageId) {
            return res.status(400).json({ message: 'examPackageId is required.' });
        }

        const result = await ExamPackageMappingService.getListExamPackageMapping({
            page: pageInt,
            limit: limitInt,
            search,
            orderBy: orderBy || 'created_at',
            order: order || 'desc',
            examPackageId,
            categoryId
        });

        if (!result.success) {
            return res.status(result.code).json({ message: result.message });
        }

        const { rows, count } = result.data;

        return res.status(result.code).json({
            data: rows,
            meta: {
                page: pageInt,
                limit: limitInt,
                total_data: count,
                total_page: Math.ceil(count / limitInt)
            }
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};
module.exports = exports;
