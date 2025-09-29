const SelectionTimelineService = require('../../../services/v1/selection_timelines');
const Language = require('../../../languages');

exports.deleteSelectionTimeline = async (req, res) => {
    let lang;

    try {
        // 1. Ambil UUID dari parameter URL (req.params)
        const { uuid } = req.params;

        // 2. Inisialisasi Bahasa (untuk diteruskan ke service)
        lang = Language.getLanguage(req.locale);

        // 3. Panggil Service untuk Menghapus Data
        // Service mengharapkan objek input dengan UUID yang akan dihapus
        const result = await SelectionTimelineService.deleteSelectionTimeline({
            uuid
        }, { lang });

        // 4. Tangani Kegagalan dari Service (misalnya 404 Not Found, 500 Delete Failed)
        if (!result.status) {
            // Gunakan code status dan pesan dari service
            return res.status(result.code).json({ message: result.message });
        }

        // 5. Kirim Respons Sukses (biasanya 200 OK atau 204 No Content)
        // Service kita dirancang untuk mengembalikan data (biasanya objek yang dihapus) dan code 200.
        return res.status(result.code).json({
            code: result.code,
            message: result.message,
            data: result.data || null // Data mungkin null/kosong untuk operasi delete
        });
    } catch (err) {
        // 6. Tangani Error Internal Server (500)
        console.error('Error in deleteSelectionTimeline controller:', err);

        const errorMessage = (lang && lang.INTERNAL_SERVER_ERROR) ? lang.INTERNAL_SERVER_ERROR : (err.message || 'Internal Server Error');

        return res.status(500).json({ message: errorMessage });
    }
};

module.exports = exports;
