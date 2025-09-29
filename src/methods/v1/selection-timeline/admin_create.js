const Language = require('../../../languages');
const SelectionTimelineService = require('../../../services/v1/selection_timelines');

exports.createSelectionTimeline = async (req, res) => {
    try {
        // 1. Ambil Data dari Body Request (req.body)
        console.log('Isi Request Body:', req.body);
        const {
            eventName,
            eventDate,
            eventColor,
            eventOrder,
            description
        } = req.body;

        // 2. Inisialisasi Bahasa (untuk diteruskan ke service)
        const lang = Language.getLanguage(req.locale);

        // 3. Panggil Service untuk Membuat Data
        // Kita meneruskan semua data yang dibutuhkan ke service
        const result = await SelectionTimelineService.createSelectionTimeline({
            eventName,
            eventDate,
            eventColor,
            eventOrder,
            description
        }, { lang });

        // 4. Tangani Kegagalan dari Service (Non-2xx)
        if (!result.status) {
            // Gunakan code status dan pesan dari service (misalnya 409 Conflict, 500 Internal Error)
            return res.status(result.code).json({ message: result.message });
        }

        // 5. Kirim Respons Sukses (biasanya 201 Created atau 200 OK)
        return res.status(result.code).json({
            code: result.code,
            message: result.message,
            data: result.data // Mengembalikan objek yang baru dibuat
        });
    } catch (err) {
        // 6. Tangani Error Internal Server (500)
        console.error('Error in createSelectionTimeline controller:', err);

        // Gunakan pesan bahasa untuk error 500
        const errorMessage = (lang && lang.INTERNAL_SERVER_ERROR) ? lang.INTERNAL_SERVER_ERROR : (err.message || 'Internal Server Error');

        return res.status(500).json({ message: errorMessage });
    }
};

module.exports = exports;
