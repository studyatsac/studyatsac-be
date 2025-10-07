const Language = require('../../../languages');
const PromotionService = require('../../../services/v1/promotion');
exports.updatePromo = async (req, res) => {
    try {
        const { uuid } = req.params;

        const updatedData = req.body;

        const lang = Language.getLanguage(req.locale);

        const input = {
            uuid,
            ...updatedData,
            file: req.file
        };

        const result = await PromotionService.updatePromo(input, { lang });

        if (!result.status) {
            return res.status(result.code).json({message: result.message});
        }

        return res.status(result.code).json({
            code: result.code,
            message: result.message,
            data: result.data
        });
    } catch (err) {
        console.error(err);

        const errorMessage = (lang && lang.INTERNAL_SERVER_ERROR) ? lang.INTERNAL_SERVER_ERROR : (err.message || 'Internal Server Error');

        return res.status(500).json({ message: errorMessage });
    }
};
