const Models = require('../../../models/mysql');
const UserPurchaseRepository = require('../../../repositories/mysql/user_purchase');
const Language = require('../../../languages');
const LogUtils = require('../../../utils/logger');
const { Op } = require('sequelize');

exports.getListUserPurchase = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            search,
        } = req.query;
        const lang = Language.getLanguage(req.locale);
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
                { '$User.full_name$': { [Op.like]: `%${search}%` } },
                { '$User.email$': { [Op.like]: `%${search}%` } }
            ];
        }

        // Ambil semua user_purchases dengan data user dan exam_package
        const { count, rows } = await Models.UserPurchase.findAndCountAll({
            where: whereClause,
            order: [[orderBy, order]],
            limit: limitInt,
            offset: offset,
            include: [
                {
                    model: Models.User,
                    attributes: ['id', 'full_name', 'email', 'institution_name', 'faculty', 'nip']
                },
                {
                    model: Models.ExamPackage,
                    attributes: ['id', 'title', 'description', 'price', 'image_url', 'is_private']
                }
            ]
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
        LogUtils.loggingError({
            function_name: 'admin_getListUserPurchase',
            message: err.message
        });
        return res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
    }
};

module.exports = exports;
