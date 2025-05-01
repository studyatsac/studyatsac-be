const Models = require('../../../models/mysql');
const UserPurchaseRepository = require('../../../repositories/mysql/user_purchase');
const Language = require('../../../languages');
const LogUtils = require('../../../utils/logger');

exports.getListUserPurchase = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const lang = Language.getLanguage(req.locale);
        const pageInt = parseInt(page, 10) || 1;
        const limitInt = parseInt(limit, 10) || 10;
        const offset = (pageInt - 1) * limitInt;

        // Ambil semua user_purchases
        const { count, rows } = await Models.UserPurchase.findAndCountAll({
            order: [['created_at', 'desc']],
            limit: limitInt,
            offset: offset
        });

        return res.status(200).json({
            data: rows,
            meta: {
                page: pageInt,
                limit: limitInt,
                totalData: count,
                totalPage: Math.ceil(count / limitInt)
            }
        });
    } catch (err) {
        LogUtils.loggingError({
            functionName: 'admin_getListUserPurchase',
            message: err.message
        });
        return res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
    }
};

module.exports = exports;
