const PopupService = require('../../../services/v1/popup');
const Language = require('../../../languages');

/**
 * GET /admin/popups/:uuid
 * Admin endpoint - Get popup detail by UUID
 */
exports.getPopupDetail = async (req, res) => {
    const lang = Language.getLanguage(req.locale);
    try {
        const { uuid } = req.params;

        const result = await PopupService.getPopupDetail({ uuid }, { lang });

        if (!result.status) {
            return res.status(result.code).json({
                success: false,
                message: result.message
            });
        }

        return res.status(result.code).json({
            success: true,
            data: result.data,
            message: result.message
        });
    } catch (err) {
        console.error('Error in getPopupDetail controller:', err);
        const errorMessage = (lang && lang.INTERNAL_SERVER_ERROR) ? lang.INTERNAL_SERVER_ERROR : 'Internal Server Error';
        return res.status(500).json({
            success: false,
            message: errorMessage
        });
    }
};
