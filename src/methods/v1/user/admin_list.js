const UserRepository = require('../../../repositories/mysql/user');
const { Op } = require('sequelize');

exports.getListUser = async (req, res) => {
    try {
        // Ambil query pagination dan search
        const { page = 1, limit = 10, search } = req.query;
        const pageInt = parseInt(page, 10) || 1;
        const limitInt = parseInt(limit, 10) || 10;
        const offset = (pageInt - 1) * limitInt;

        // Buat where clause untuk search
        const whereClause = {};
        if (search) {
            whereClause[Op.or] = [
                { full_name: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } }
            ];
        }

        // Query data user dan total count
        const { rows, count } = await UserRepository.findAndCountAll(whereClause, { 
            offset, 
            limit: limitInt,
            order: [['created_at', 'desc']]
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
