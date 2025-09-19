const ExamPackageMappingService = require('../../../services/v1/exam_package_mapping');

exports.getListExamPackageMapping = async (req, res) => {
    try {
        const {
            page = 1, limit = 10, search, orderBy, order
        } = req.query;

        // Validasi input
        const pageInt = parseInt(page, 10) || 1;
        const limitInt = parseInt(limit, 10) || 10;

        const result = await ExamPackageMappingService.getExamMappingList({
            page: pageInt,
            limit: limitInt,
            search,
            orderBy: orderBy || 'created_at',
            order: order || 'desc'
        });

        // Tangani respons berdasarkan properti `success`
        // Jika `success` false, kembalikan pesan error
        if (!result.success) {
            return res.status(result.code).json({ message: result.message });
        }

        // Jika `success` true, kembalikan data
        const data = { rows: result.data.rows, count: result.data.count };

        return res.status(200).json({
            status: result.code,
            message: result.message,
            data: data.rows,
            meta: {
                page: pageInt,
                limit: limitInt,
                total_data: data.count,
                total_page: Math.ceil(data.count / limitInt)
            }
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = exports;
