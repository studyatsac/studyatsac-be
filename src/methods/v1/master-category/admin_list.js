const { Op } = require('sequelize');
const MasterCategoryRepositories = require('../../../repositories/mysql/master_category');

exports.getListMasterCategory = async (req, res) => {
    try {
        // Ambil query pagination dan search
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
                { title: { [Op.like]: `%${search}%` } }
            ];
        }

        // Query data user dan total count
        const { rows, count } = await MasterCategoryRepositories.findAndCountAll(whereClause, {
            offset,
            limit: limitInt,
            order: [[orderBy, order]]
        });

        return res.status(200).json({
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
