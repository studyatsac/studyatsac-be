const { Op } = require('sequelize');
const SectionRepository = require('../../../repositories/mysql/section');
const LogUtils = require('../../../utils/logger');

exports.getListSection = async (req, res) => {
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
                { '$Section.section_type$': { [Op.like]: `%${search}%` } }
            ];
        }

        const optionsClause = {
            where: whereClause,
            order: [[orderBy, order]],
            limit: limitInt,
            offset
        };

        const section = await SectionRepository.findAndCountAll(whereClause, optionsClause);
        const data = { rows: section.rows, count: section.count };

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
            function_name: 'admin_getListQuestion',
            message: err.message
        });
        return res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
    }
};

module.exports = exports;
