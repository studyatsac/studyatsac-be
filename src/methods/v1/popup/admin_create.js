const PopupService = require('../../../services/v1/popup');
const Language = require('../../../languages');
const validation = require('../../../validations/v1/popup/create');

/**
 * POST /admin/popups
 * Admin endpoint - Create new popup
 * Supports both file upload and manual image_url
 */
exports.createPopup = async (req, res) => {
    const lang = Language.getLanguage(req.locale);
    try {
        // Validate request body
        const schema = validation(lang);
        const { error, value } = schema.validate(req.body);

        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: error.message
            });
        }

        // Get user ID from token
        const userId = req.user?.id;

        // Add file to input if uploaded
        const input = value;
        if (req.file) {
            input.file = req.file;
        }

        const result = await PopupService.createPopup(input, userId, { lang });

        if (!result.status) {
            return res.status(result.code).json({
                success: false,
                message: result.message
            });
        }

        return res.status(result.code).json({
            success: true,
            message: result.message,
            data: result.data
        });
    } catch (err) {
        console.error('Error in createPopup controller:', err);
        const errorMessage = (lang && lang.INTERNAL_SERVER_ERROR) ? lang.INTERNAL_SERVER_ERROR : 'Internal Server Error';
        return res.status(500).json({
            success: false,
            message: errorMessage
        });
    }
};
