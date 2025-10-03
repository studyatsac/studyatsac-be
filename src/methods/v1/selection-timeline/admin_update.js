const Language = require('../../../languages');
const SelectionTimelineService = require('../../../services/v1/selection_timelines');

exports.updateSelectionTimeline = async (req, res) => {
    try {
        // 1. Ambil UUID dari parameter URL
        const { uuid } = req.params;

        // 2. Ambil SELURUH data yang diperbarui dari req.body
        // Kita tidak perlu mendestrukturisasi item body satu per satu.
        const updatedData = req.body;

        // 3. Inisialisasi Bahasa
        const lang = Language.getLanguage(req.locale);

        // 4. Panggil Service untuk Memperbarui Data
        // Gabungkan UUID (untuk WHERE) dengan updatedData (untuk SET)
        const input = {
            uuid, // Kunci pencarian
            ...updatedData // Data yang akan di-update (termasuk eventName, eventDate, dkk.)
        };

        const result = await SelectionTimelineService.updateSelectionTimeline(input, { lang });

        // 5. Tangani Kegagalan dari Service (404, 500)
        if (!result.status) {
            return res.status(result.code).json({ message: result.message });
        }

        // 6. Kirim Respons Sukses (200 OK)
        return res.status(result.code).json({
            code: result.code,
            message: result.message,
            data: result.data // Mengembalikan objek yang sudah diperbarui
        });
    } catch (err) {
        // 7. Tangani Error Internal Server (500)
        console.error('Error in updateSelectionTimeline controller:', err);

        const errorMessage = (lang && lang.INTERNAL_SERVER_ERROR) ? lang.INTERNAL_SERVER_ERROR : (err.message || 'Internal Server Error');

        return res.status(500).json({ message: errorMessage });
    }
};

module.exports = exports;
