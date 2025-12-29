const PopupService = require('../../../services/v1/popup');
const Language = require('../../../languages');

/**
 * GET /admin/popups
 * Admin endpoint - Get list of all popups with pagination
 */
exports.getPopupList = async (req, res) => {
    const lang = Language.getLanguage(req.locale);
    try {
        const {
            page = 1, limit = 10, status, search, sort_by = 'created_at', sort_order = 'DESC'
        } = req.query;

        const filters = {};
        if (status !== undefined) {
            filters.status = parseInt(status);
        }
        if (search) {
            filters.search = search;
        }

        const pagination = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort_by,
            sort_order
        };

        const result = await PopupService.getPopupList(filters, pagination, { lang });

        if (!result.status) {
            return res.status(result.code).json({
                success: false,
                message: result.message
            });
        }

        return res.status(result.code).json({
            success: true,
            data: result.data.rows,
            pagination: {
                page: pagination.page,
                limit: pagination.limit,
                total: result.data.count,
                total_pages: Math.ceil(result.data.count / pagination.limit)
            }
        });
    } catch (err) {
        console.error('Error in getPopupList controller:', err);
        const errorMessage = (lang && lang.INTERNAL_SERVER_ERROR) ? lang.INTERNAL_SERVER_ERROR : 'Internal Server Error';
        return res.status(500).json({
            success: false,
            message: errorMessage
        });
    }
};
