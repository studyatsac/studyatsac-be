const Language = require('../../../languages');
const SelectionTimelineService = require('../../../services/v1/selection_timelines');

exports.getListSelectionTimeline = async (req, res) => {
    let lang;
    try {
        // 1. Ambil dan Atur Default/Parse Input
        const { query } = req;
        // Gunakan nilai default 1 dan 10 jika tidak ada, dan pastikan di-parse sebagai integer.
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 999999999;

        // Buat objek input untuk service
        const input = {
            page,
            limit
        };

        // 2. Inisialisasi Bahasa (untuk pesan error 500)
        // Ambil bahasa (meskipun hanya untuk error internal, ini praktik yang bagus)
        lang = Language.getLanguage(req.locale);

        // 3. Panggil Service untuk Mendapatkan Data
        const result = await SelectionTimelineService.getListSelectionTimeline(input, { lang });

        // 4. Tangani Kegagalan dari Service (Non-200 OK)
        if (!result.status) {
            // Gunakan code status dari service (misalnya 404, 500)
            return res.status(result.code)
                .json({ message: result.message });
        }

        // 5. Format dan Kirim Respons Sukses
        const data = result.data || {};
        const rows = data.rows || [];

        // Langsung kembalikan 'rows' dari service tanpa transformasi
        return res.status(200)
            .json({
                // Pesan dari service
                messages: result.message,
                data: rows, // LANGSUNG MENGGUNAKAN DATA MENTAH DARI SERVICE/REPOSITORY
                meta: {
                    page,
                    limit,
                    total_data: data.count, // Jumlah data total dari service
                    total_page: Math.ceil(data.count / limit) // Total halaman
                }
            });
    } catch (err) {
        // 6. Tangani Error Internal Server (500)
        console.error('Error in getListSelectionTimeline controller:', err);

        // Gunakan pesan bahasa untuk error 500 jika tersedia
        const errorMessage = (lang && lang.INTERNAL_SERVER_ERROR) ? lang.INTERNAL_SERVER_ERROR : (err.message || 'Internal Server Error');

        return res.status(500)
            .json({ message: errorMessage });
    }
};

module.exports = exports;
