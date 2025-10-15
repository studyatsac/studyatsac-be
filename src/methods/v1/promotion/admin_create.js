const Language = require('../../../languages');
const PromoService = require('../../../services/v1/promotion');

exports.createPromo = async (req, res) => {
    // Inisialisasi bahasa di awal untuk digunakan juga di blok catch
    const lang = Language.getLanguage(req.locale);

    try {
        // 1. Ambil Data dari Body Request (req.body)
        const {
            promo_name,
            link_promo,
            start_date,
            end_date
        } = req.body;

        // 2. Panggil Service untuk Membuat Data
        // Meneruskan data y    ang relevan dari body ke service
        const result = await PromoService.createPromo({
            promo_name,
            link_promo,
            start_date,
            end_date,
            file: req.file
        }, { lang }); // Opsi `{ lang }` juga diteruskan

        // 3. Tangani Kegagalan dari Service (jika status-nya false)
        if (!result.status) {
            // Menggunakan kode status dan pesan yang dikembalikan oleh service
            return res.status(result.code).json({ message: result.message });
        }

        // 4. Kirim Respons Sukses
        // Service akan mengembalikan kode 201 (Created) jika berhasil
        return res.status(result.code).json({
            code: result.code,
            message: result.message,
            data: result.data // Mengembalikan data promo yang baru dibuat
        });
    } catch (err) {
        // 5. Tangani Error Tak Terduga (Internal Server Error)
        console.error('Error in createPromo controller:', err);

        // Menggunakan pesan bahasa untuk error 500
        const errorMessage = (lang && lang.INTERNAL_SERVER_ERROR)
            ? lang.INTERNAL_SERVER_ERROR
            : 'Internal Server Error';

        return res.status(500).json({ message: errorMessage });
    }
};
