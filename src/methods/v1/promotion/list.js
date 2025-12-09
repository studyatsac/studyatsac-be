const Language = require('../../../languages');
const PromoService = require('../../../services/v1/promotion');

exports.getListPromos = async (req, res) => {
    let lang;
    try {
        // 1. Inisialisasi Bahasa
        lang = Language.getLanguage(req.locale);

        // 2. Panggil Service untuk Mendapatkan Semua Data
        // Kita panggil service yang sesuai, misalnya `getAllPromos`
        // Tidak ada input dari query (seperti page/limit) yang perlu dikirim.
        const result = await PromoService.getAllActivePromos({}, { lang });

        // 3. Tangani Kegagalan dari Service (misalnya, tidak ada data)
        if (!result.status) {
            // Menggunakan kode status dari service (misalnya 404)
            return res.status(result.code).json({ message: result.message });
        }

        // 4. Kirim Respons Sukses
        // Karena tidak ada paginasi, kita langsung kirim array data.
        return res.status(200)
            .json({
                code: result.code,
                messages: result.message,
                data: result.data // Langsung mengembalikan array promo
            });
    } catch (err) {
        // 5. Tangani Error Internal Server (500)
        console.error('Error in getListPromos controller:', err);

        const errorMessage = (lang && lang.INTERNAL_SERVER_ERROR)
            ? lang.INTERNAL_SERVER_ERROR
            : 'Internal Server Error';

        return res.status(500)
            .json({ message: errorMessage });
    }
};
