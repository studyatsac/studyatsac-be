const ExamPackageMappingService = require('../../../services/v1/exam_package_mapping');

// exports.getListExamPackageMappingSimple = async (req, res) => {
//     try {
//         const result = await ExamPackageMappingService.getExamMappingListSimple();
//
//         if (!result.success) {
//             return res.status(result.code).json({ message: result.message });
//         }
//
//         const { rows, count } = result.data;
//
//         return res.status(result.code).json({
//             data: rows,
//             message: result.message,
//             meta: {
//                 total_data: count
//             }
//         });
//     } catch (err) {
//         return res.status(500).json({ message: err.message });
//     }
// };
exports.getListExamPackageMapping = async (req, res) => {
    try {
        const { page = 1, limit = 10, search, orderBy, order } = req.query;

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
        const { rows, count } = result.data;

        return res.status(result.code).json({
            data: rows,
            message: result.message, // Tambahkan message dari service
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
// exports.getListExamPackageMapping = async (req, res) => {
//     try {
//         const { page = 1, limit = 10, search, orderBy, order, examPackageId, categoryId } = req.query;
//
//         // Validasi input
//         const pageInt = parseInt(page, 10) || 1;
//         const limitInt = parseInt(limit, 10) || 10;
//
//         // if (!examPackageId) {
//         //     return res.status(400).json({ message: 'examPackageId is required.' });
//         // }
//
//         const result = await ExamPackageMappingService.getExamMappingList({
//             page: pageInt,
//             limit: limitInt,
//             search,
//             orderBy: orderBy || 'created_at',
//             order: order || 'desc',
//             examPackageId,
//             categoryId
//         });
//
//         if (!result.success) {
//             return res.status(result.code).json({ message: result.message });
//         }
//
//         const { rows, count } = result.data;
//
//         return res.status(result.code).json({
//             data: rows,
//             message: result.message,
//             meta: {
//                 page: pageInt,
//                 limit: limitInt,
//                 total_data: count,
//                 total_page: Math.ceil(count / limitInt)
//             }
//         });
//     } catch (err) {
//         return res.status(500).json({ message: err.message });
//     }
// };
//module.exports = exports;
