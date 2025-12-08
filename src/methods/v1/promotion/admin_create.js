const Language = require('../../../languages');
const PromoService = require('../../../services/v1/promotion');

exports.createPromo = async (req, res) => {
    // Inisialisasi bahasa di awal untuk digunakan juga di blok catch
    const lang = Language.getLanguage(req.locale);

    try {
        // 1. Validasi file upload (poster wajib ada)
        if (!req.file) {
            return res.status(400).json({
                message: lang.PROMO?.FILE_REQUIRED || 'Poster file is required'
            });
        }

        // 2. Ambil Data dari Body Request (req.body)
        const {
            promo_name,
            link_promo,
            start_date,
            end_date
        } = req.body;

        // 3. Panggil Service untuk Upload File dan Membuat Data
        // File akan diupload ke Supabase dan linknya akan disimpan otomatis
        const result = await PromoService.createPromo({
            promo_name,
            link_promo,
            start_date,
            end_date,
            file: req.file // File akan diproses di service untuk upload
        }, { lang });

        // 4. Tangani Kegagalan dari Service (jika status-nya false)
        if (!result.status) {
            // Menggunakan kode status dan pesan yang dikembalikan oleh service
            return res.status(result.code).json({ message: result.message });
        }

        // 5. Kirim Respons Sukses
        // Data akan berisi poster_link yang sudah diupload
        return res.status(result.code).json({
            code: result.code,
            message: result.message,
            data: result.data // Mengembalikan data promo dengan poster_link
        });
    } catch (err) {
        // 6. Tangani Error Tak Terduga (Internal Server Error)
        console.error('Error in createPromo controller:', err);

        // Menggunakan pesan bahasa untuk error 500
        const errorMessage = (lang && lang.INTERNAL_SERVER_ERROR)
            ? lang.INTERNAL_SERVER_ERROR
            : 'Internal Server Error';

        return res.status(500).json({ message: errorMessage });
    }
};
