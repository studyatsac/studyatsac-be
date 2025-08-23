const { Op } = require('sequelize');
const UserPurchaseRepository = require('../../../repositories/mysql/user_purchase');
const Models = require('../../../models/mysql');
const LogUtils = require('../../../utils/logger');

exports.getListUserPurchase = async (req, res) => {
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
                { '$User.full_name$': { [Op.like]: `%${search}%` } },
                { '$User.email$': { [Op.like]: `%${search}%` } }
            ];
        }

        const optionsClause = {
            where: whereClause,
            order: [[orderBy, order]],
            limit: limitInt,
            offset,
            include: [
                {
                    model: Models.User,
                    attributes: ['id', 'full_name', 'email', 'institution_name', 'faculty', 'nip']
                },
                {
                    model: Models.ExamPackage,
                    attributes: ['id', 'uuid', 'title', 'price', 'description', 'additional_information', 'isPrivate', 'imageUrl']
                },
                {
                    model: Models.ProductPackage,
                    attributes: ['id', 'uuid', 'title', 'type', 'description', 'price', 'totalMaxAttempt', 'additional_information', 'defaultItemMaxAttempt', 'paymentUrl', 'isActive'],
                    as: 'productPackage'
                }
            ]
        };

        const purchases = await UserPurchaseRepository.findAndCountAll(whereClause, optionsClause);
        const data = { rows: purchases.rows, count: purchases.count };

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
            function_name: 'admin_getListUserExam',
            message: err.message
        });
        return res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
    }
};

module.exports = exports;
