const Language = require('../../../languages');
const PromoService = require('../../../services/v1/promotion');

exports.getDetailPromo = async (req, res) => {
    // Inisialisasi bahasa di awal untuk digunakan juga di blok catch
    const lang = Language.getLanguage(req.locale);

    try {
        // 1. Ambil Data dari Parameter URL (req.params)
        // Untuk detail, ID unik biasanya dikirim lewat URL, bukan body
        const { uuid } = req.params;

        // 2. Panggil Service untuk Mengambil Data
        const result = await PromoService.getDetailPromo({ uuid }, { lang });

        // 3. Tangani Kegagalan dari Service (misalnya, data tidak ditemukan)
        if (!result.status) {
            // Service akan mengembalikan kode 404 jika promo tidak ditemukan
            return res.status(result.code).json({ message: result.message });
        }

        // 4. Kirim Respons Sukses
        // Service akan mengembalikan kode 200 (OK) jika berhasil
        return res.status(result.code).json({
            code: result.code,
            message: result.message,
            data: result.data // Mengembalikan objek promo yang ditemukan
        });
    } catch (err) {
        // 5. Tangani Error Tak Terduga (Internal Server Error)
        console.error('Error in getDetailPromo controller:', err);

        const errorMessage = (lang && lang.INTERNAL_SERVER_ERROR)
            ? lang.INTERNAL_SERVER_ERROR
            : 'Internal Server Error';

        return res.status(500).json({ message: errorMessage });
    }
};
