const { Op } = require('sequelize');
const ExamPackageCategoryRepository = require('../../../repositories/mysql/exam_package_category');
const Models = require('../../../models/mysql');
const LogUtils = require('../../../utils/logger');

exports.getListExamPackageCategory = async (req, res) => {
    try {
        const { page = 1, limit = 10, search } = req.query;
        const pageInt = parseInt(page, 10) || 1;
        const limitInt = parseInt(limit, 10) || 10;
        const offset = (pageInt - 1) * limitInt;

        // Ambil orderBy dan order langsung dari req.query tanpa validasi
        const orderBy = req.query.orderBy || 'created_at';
        const order = req.query.order || 'desc';

        // Buat where clause untuk search
        const whereClause = {};
        if (search) {
            whereClause[Op.or] = [
                { '$MasterCategory.title$': { [Op.like]: `%${search}%` } },
                { '$ExamPackage.title$': { [Op.like]: `%${search}%` } }
            ];
        }

        const optionsClause = {
            where: whereClause,
            order: [[orderBy, order]],
            limit: limitInt,
            offset,
            include: [
                {
                    model: Models.ExamPackage,
                    as: 'exam_package',
                    attributes: ['id', 'uuid', 'title', 'description', 'additional_information', 'price', 'image_url', 'is_private']
                },
                {
                    model: Models.MasterCategory,
                    as: 'master_category',
                    attributes: ['id', 'uuid', 'title']
                }
            ]
        };

        const examPackageCategory = await ExamPackageCategoryRepository.findAndCountAll(whereClause, optionsClause);
        const data = { rows: examPackageCategory.rows, count: examPackageCategory.count };

        return res.status(200).json({
            data: data.rows,
            meta: {
                page: pageInt,
                limit: limitInt,
                total_data: data.count,
                total_page: Math.ceil(data.count / limitInt)
            }
        });
    } catch (err) {
        LogUtils.logError({
            function_name: 'admin_getListExamPackageCategory',
            message: err.message
        });
        return res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
    }
};

module.exports = exports;
