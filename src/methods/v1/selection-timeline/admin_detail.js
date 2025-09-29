const Language = require('../../../languages');
const SelectionTimelineService = require('../../../services/v1/selection_timelines');

let lang;
exports.getDetailSelectionTimeline = async (req, res) => {
    try {
        // 1. Ambil UUID dari parameter URL (req.params)
        const { uuid } = req.params;

        // Buat objek input untuk service
        const input = { uuid };

        // 2. Inisialisasi Bahasa (untuk pesan error 500)
        lang = Language.getLanguage(req.locale);

        // 3. Panggil Service untuk Mendapatkan Detail Data
        // Service kita mengharapkan objek input dan opts
        const result = await SelectionTimelineService.getDetailSelectionTimeline(input, { lang });

        // 4. Tangani Kegagalan dari Service (misalnya 404 Not Found)
        if (!result.status) {
            // Gunakan code status dan pesan dari service
            return res.status(result.code).json({ message: result.message });
        }

        // 5. Kirim Respons Sukses
        // Data yang dikembalikan langsung dari service
        return res.status(200).json({
            message: result.message,
            data: result.data
        });
    } catch (err) {
        // 6. Tangani Error Internal Server (500)
        console.error('Error in getDetailSelectionTimeline controller:', err);

        // Gunakan pesan bahasa untuk error 500
        const errorMessage = (lang && lang.INTERNAL_SERVER_ERROR) ? lang.INTERNAL_SERVER_ERROR : (err.message || 'Internal Server Error');

        return res.status(500).json({ message: errorMessage });
    }
};

module.exports = exports;
