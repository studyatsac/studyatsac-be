const PromoRepository = require('../../repositories/mysql/promotion');
const Response = require('../../utils/response');
const supabase = require('../../utils/supabase');
const Helpers = require('../../utils/helpers');

const getAllActivePromos = async (input, opts = {}) => {
    const language = opts.lang;

    try {
        // Opsi untuk mengurutkan data, promo terbaru akan muncul di atas.
        const optionsClause = {
            order: [['created_at', 'desc']]
        };

        // Memanggil repository untuk mencari semua promo yang aktif.
        // Fungsi ini sudah secara otomatis memfilter berdasarkan tanggal hari ini.
        const promos = await PromoRepository.findAllActivePromos(optionsClause);

        // Jika tidak ada promo aktif yang ditemukan.
        if (!promos || promos.length === 0) {
            return Response.formatServiceReturn(false, 404, null, language.PROMO.NOT_FOUND);
        }

        // Langsung mengembalikan array berisi data promo.
        return Response.formatServiceReturn(true, 200, promos, language.PROMO.SUCCESS_LIST);
    } catch (error) {
        // Penanganan jika terjadi error di server.
        console.error('Error in getAllActivePromos service:', error);
        return Response.formatServiceReturn(false, 500, null, language.PROMO.FAILED_LIST);
    }
};

const getAllActivePromosWithPagination = async (input, opts = {}) => {
    const language = opts.lang;

    try {
        const { page, limit } = input;

        // Opsi untuk mengurutkan data dan pagination
        const optionsClause = {
            limit,
            offset: Helpers.setOffset(page, limit),
            order: [['created_at', 'desc']]
        };

        // Memanggil repository untuk mencari semua promo yang aktif dengan pagination.
        const { rows, count } = await PromoRepository.findAndCountAllActivePromos(optionsClause);

        // Jika tidak ada promo aktif yang ditemukan.
        if (count === 0) {
            return Response.formatServiceReturn(false, 404, null, language.PROMO.NOT_FOUND);
        }

        const data = { rows, count };
        return Response.formatServiceReturn(true, 200, data, language.PROMO.SUCCESS_LIST);
    } catch (error) {
        // Penanganan jika terjadi error di server.
        console.error('Error in getAllActivePromosWithPagination service:', error);
        return Response.formatServiceReturn(false, 500, null, language.PROMO.FAILED_LIST);
    }
};

const getDetailPromo = async (input, opts = {}) => {
    const language = opts.lang;

    try {
        // Mencari promo berdasarkan UUID
        const promo = await PromoRepository.findOne({ uuid: input.uuid });

        // Jika promo tidak ditemukan
        if (!promo) {
            return Response.formatServiceReturn(false, 404, null, language.PROMO.NOT_FOUND);
        }

        // Mengembalikan respons sukses
        return Response.formatServiceReturn(true, 200, promo, language.PROMO.SUCCESS_GET_DETAIL);
    } catch (error) {
        console.error('Error in getDetailPromo service:', error);
        return Response.formatServiceReturn(false, 500, null, language.PROMO.FAILED_GET_DETAIL);
    }
};

const createPromo = async (input, opts = {}) => {
    const language = opts.lang;

    try {
        let posterUrl = null; // Variabel untuk menyimpan URL poster

        // 1. Handle proses upload file jika ada file yang dikirim
        if (input.file) {
            // Membuat nama file yang unik untuk menghindari konflik penamaan
            const uniqueFileName = `${Date.now()}-${input.file.originalname}`;
            const filePath = `posters/${uniqueFileName}`; // Simpan di dalam folder 'posters'

            // A. Unggah file ke Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('my-uploads') // GANTI DENGAN NAMA BUCKET ANDA
                .upload(filePath, input.file.buffer, {
                    contentType: input.file.mimetype
                });

            if (uploadError) {
                console.error('Supabase Upload Error:', uploadError);
                // Gagal upload, kembalikan error spesifik
                return Response.formatServiceReturn(false, 500, null, language.PROMO.UPLOAD_FAILED);
            }

            // B. Dapatkan URL publik dari file yang baru diunggah
            const { data: publicUrlData } = supabase.storage
                .from('my-uploads') // GANTI DENGAN NAMA BUCKET ANDA
                .getPublicUrl(filePath);

            if (!publicUrlData || !publicUrlData.publicUrl) {
                return Response.formatServiceReturn(false, 500, null, language.PROMO.GET_URL_FAILED);
            }

            posterUrl = publicUrlData.publicUrl;
        }
        const createData = {
            promo_name: input.promo_name,
            poster_link: posterUrl,
            link_promo: input.link_promo,
            start_date: input.start_date,
            end_date: input.end_date
        };

        const newPromo = await PromoRepository.create(createData, opts);

        if (!newPromo) {
            return Response.formatServiceReturn(false, 500, null, language.PROMO.CREATE_FAILED);
        }

        return Response.formatServiceReturn(true, 201, newPromo, language.PROMO.CREATE_SUCCESS);
    } catch (error) {
        console.error('Error in createPromo service:', error);

        // Menangani error validasi dari Sequelize
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            return Response.formatServiceReturn(false, 400, null, error.message);
        }

        // Menangani error server lainnya
        return Response.formatServiceReturn(false, 500, null, language.PROMO.CREATE_FAILED);
    }
};

const updatePromo = async (input, opts = {}) => {
    const language = opts.lang;
    const BUCKET_NAME = 'my-uploads'; // GANTI DENGAN NAMA BUCKET ANDA

    try {
        // 1. Cek dulu apakah data promo ada di database
        const promo = await PromoRepository.findOne({ uuid: input.uuid });
        if (!promo) {
            return Response.formatServiceReturn(false, 404, null, language.PROMO.NOT_FOUND);
        }

        const updateData = {
            promo_name: input.promo_name,
            link_promo: input.link_promo,
            start_date: input.start_date,
            end_date: input.end_date
        };

        // 2. Handle upload file baru HANYA JIKA ada file yang dikirim
        if (input.file) {
            // === LOGIKA BARU: HAPUS FILE LAMA JIKA ADA ===
            // A. Cek apakah ada link poster lama di database
            if (promo.poster_link) {
                try {
                    // B. Ekstrak path file dari URL lengkap
                    // Contoh URL: https://<...>.supabase.co/storage/v1/object/public/my-uploads/posters/12345.jpg
                    // Kita butuh path-nya saja: 'posters/12345.jpg'
                    const oldFilePath = promo.poster_link.split(`${BUCKET_NAME}/`)[1];

                    // C. Hapus file lama dari Supabase Storage
                    const { error: deleteError } = await supabase.storage
                        .from(BUCKET_NAME)
                        .remove([oldFilePath]);

                    if (deleteError) {
                        // Catat error tapi jangan hentikan proses, update tetap bisa dilanjutkan
                        console.error('Supabase Delete Error:', deleteError);
                    }
                } catch (e) {
                    console.error('Error parsing or deleting old file:', e.message);
                }
            }
            // === SELESAI LOGIKA HAPUS FILE LAMA ===

            // Lanjutkan proses upload file baru seperti biasa
            const uniqueFileName = `${Date.now()}-${input.file.originalname}`;
            const newFilePath = `posters/${uniqueFileName}`;

            const { error: uploadError } = await supabase.storage
                .from(BUCKET_NAME)
                .upload(newFilePath, input.file.buffer, {
                    contentType: input.file.mimetype
                });

            if (uploadError) {
                console.error('Supabase Upload Error:', uploadError);
                return Response.formatServiceReturn(false, 500, null, language.PROMO.UPLOAD_FAILED);
            }

            const { data: publicUrlData } = supabase.storage
                .from(BUCKET_NAME)
                .getPublicUrl(newFilePath);

            if (!publicUrlData || !publicUrlData.publicUrl) {
                return Response.formatServiceReturn(false, 500, null, language.PROMO.GET_URL_FAILED);
            }

            // Tambahkan link poster baru ke data yang akan di-update
            updateData.poster_link = publicUrlData.publicUrl;
        }

        // 3. Panggil repository untuk update data di database
        const [updatedRows] = await PromoRepository.update(updateData, { uuid: input.uuid });

        if (updatedRows === 0) {
            // Ini bisa terjadi jika data yang dikirim sama persis dengan data yang sudah ada
            // Kita bisa anggap ini sukses karena state-nya sudah sesuai keinginan
        }

        // 4. Ambil data terbaru untuk dikembalikan
        const updatedPromo = await PromoRepository.findOne({ uuid: input.uuid });

        return Response.formatServiceReturn(true, 200, updatedPromo, language.PROMO.UPDATE_SUCCESS);
    } catch (error) {
        console.error('Error in updatePromo service:', error);
        return Response.formatServiceReturn(false, 500, null, language.PROMO.UPDATE_FAILED);
    }
};

const deletePromo = async (input, opts = {}) => {
    const language = opts.lang;

    try {
        // 1. Cek dulu apakah promo-nya ada
        const promo = await PromoRepository.findOne({ uuid: input.uuid });
        if (!promo) {
            return Response.formatServiceReturn(false, 404, null, language.PROMO.NOT_FOUND);
        }

        // 2. Panggil repository untuk menghapus data
        const deletedRows = await PromoRepository.delete({ uuid: input.uuid });

        // Jika tidak ada baris yang terhapus
        if (deletedRows === 0) {
            return Response.formatServiceReturn(false, 500, null, language.PROMO.DELETE_FAILED);
        }

        // Mengembalikan respons sukses
        return Response.formatServiceReturn(true, 200, null, language.PROMO.DELETE_SUCCESS);
    } catch (error) {
        console.error('Error in deletePromo service:', error);
        return Response.formatServiceReturn(false, 500, null, language.PROMO.DELETE_FAILED);
    }
};

module.exports = {
    getAllActivePromos,
    getAllActivePromosWithPagination,
    getDetailPromo,
    createPromo,
    updatePromo,
    deletePromo
};
