const PopupService = require('../../../services/v1/popup');
const Language = require('../../../languages');

/**
 * DELETE /admin/popups/:uuid
 * Admin endpoint - Delete popup by UUID
 */
exports.deletePopup = async (req, res) => {
    const lang = Language.getLanguage(req.locale);
    try {
        const { uuid } = req.params;

        const result = await PopupService.deletePopup({ uuid }, { lang });

        if (!result.status) {
            return res.status(result.code).json({
                success: false,
                message: result.message
            });
        }

        return res.status(result.code).json({
            success: true,
            message: result.message
        });
    } catch (err) {
        console.error('Error in deletePopup controller:', err);
        const errorMessage = (lang && lang.INTERNAL_SERVER_ERROR) ? lang.INTERNAL_SERVER_ERROR : 'Internal Server Error';
        return res.status(500).json({
            success: false,
            message: errorMessage
        });
    }
};
