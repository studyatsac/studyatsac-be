const Language = require('../../../languages');
const PromoService = require('../../../services/v1/promotion');

exports.deletePromo = async (req, res) => {
    let lang;

    try {
        const { uuid } = req.params;

        lang = Language.getLanguage(req.locale);

        const result = await PromoService.deletePromo({
            uuid
        }, { lang });

        if (!result.status) {
            // Gunakan code status dan pesan dari service
            return res.status(result.code).json({ message: result.message });
        }

        return res.status(result.code).json({
            code: result.code,
            message: result.message,
            data: result.data || null // Data mungkin null/kosong untuk operasi delete
        });
    } catch (err) {
        // 6. Tangani Error Internal Server (500)
        console.error('Error in deletePromo controller:', err);

        const errorMessage = (lang && lang.INTERNAL_SERVER_ERROR) ? lang.INTERNAL_SERVER_ERROR : (err.message || 'Internal Server Error');

        return res.status(500).json({ message: errorMessage });
    }
};
