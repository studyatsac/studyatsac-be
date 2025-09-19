const ExamPackageCategoryService = require('../../../services/v1/exam_package_category');

exports.getListExamPackageCategory = async (req, res) => {
    try {
        const {
            page = 1, limit = 10, search, orderBy, order
        } = req.query;

        // Validasi input
        const pageInt = parseInt(page, 10) || 1;
        const limitInt = parseInt(limit, 10) || 10;

        // Panggil Service
        const result = await ExamPackageCategoryService.getListExamPackageCategory({
            page: pageInt,
            limit: limitInt,
            search,
            orderBy: orderBy || 'created_at',
            order: order || 'desc'
        }); // Pastikan lang dikirim ke service

        if (!result.success) {
            return res.status(result.data.code).json({ message: result.message });
        }

        const data = { rows: result.data.rows, count: result.data.count };

        // Kembalikan respons dengan format meta data
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
