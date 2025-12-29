const PopupService = require('../../../services/v1/popup');
const Language = require('../../../languages');

/**
 * GET /popup/active
 * Public endpoint - Get active popup for landing page
 * No authentication required
 */
exports.getActivePopup = async (req, res) => {
    const lang = Language.getLanguage(req.locale);
    try {
        const result = await PopupService.getActivePopup({ lang });

        return res.status(result.code).json({
            success: result.status,
            data: result.data,
            message: result.message
        });
    } catch (err) {
        console.error('Error in getActivePopup controller:', err);
        const errorMessage = (lang && lang.INTERNAL_SERVER_ERROR) ? lang.INTERNAL_SERVER_ERROR : 'Internal Server Error';
        return res.status(500).json({
            success: false,
            message: errorMessage
        });
    }
};
