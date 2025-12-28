const { Op } = require('sequelize');
const ScholarshipRepository = require('../../repositories/mysql/scholarship');
const { sequelize } = require('../../models/mysql');
const Helpers = require('../../utils/helpers');
const Response = require('../../utils/response');

const getScholarshipListAdmin = async (input, opts = {}) => {
    const language = opts.lang;
    try {
        const { page, limit } = input;
        const whereClause = {}; // Admin bisa melihat semua
        const optionsClause = {
            limit,
            offset: Helpers.setOffset(page, limit),
            order: [['open_date', 'DESC']] // Diurutkan berdasarkan tanggal buka
        };

        const { rows, count } = await ScholarshipRepository.findAndCountAll(whereClause, optionsClause);
        if (count === 0) {
            return Response.formatServiceReturn(false, 404, null, language.SCHOLARSHIP.NOT_FOUND);
        }

        const data = { rows, count };
        return Response.formatServiceReturn(true, 200, data, language.SCHOLARSHIP.SUCCESS_LIST);
    } catch (error) {
        console.error('Error in getScholarshipListAdmin service:', error);
        return Response.formatServiceReturn(false, 500, null, language.SCHOLARSHIP.FAILED_LIST);
    }
};

const getScholarshipDetail = async (input, opts = {}) => {
    const language = opts.lang;
    try {
        const scholarship = await ScholarshipRepository.findOne({ uuid: input.uuid }); // Tampilkan baik aktif maupun tidak aktif
        if (!scholarship) {
            return Response.formatServiceReturn(false, 404, null, language.SCHOLARSHIP.NOT_FOUND);
        }
        return Response.formatServiceReturn(true, 200, scholarship, language.SCHOLARSHIP.SUCCESS_GET_DETAIL);
    } catch (error) {
        console.error('Error in getScholarshipDetail service:', error);
        return Response.formatServiceReturn(false, 500, null, language.SCHOLARSHIP.FAILED_GET_DETAIL);
    }
};

const getScholarshipListPublic = async (input, opts = {}) => {
    const language = opts.lang;
    try {
        const {
            page, limit, month, search, type, country, level
        } = input;

        // Filter default: hanya tampilkan beasiswa yang aktif
        const whereClause = { status: 1 };

        // Logika filter bulanan
        if (month) {
            const year = new Date().getFullYear(); // Asumsi filter untuk tahun ini
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0); // Trik untuk mendapatkan hari terakhir di bulan itu
            whereClause.open_date = {
                [Op.between]: [startDate, endDate]
            };
        }

        // Logika filter search
        if (search) {
            whereClause[Op.or] = [
                { scholarship_name: { [Op.like]: `%${search}%` } },
                { university: { [Op.like]: `%${search}%` } },
                { country: { [Op.like]: `%${search}%` } }
            ];
        }

        // Logika filter type (Fully Funded, Partially Funded, Exchange, Internship)
        if (type && type.length > 0) {
            whereClause.type = { [Op.in]: type };
        }

        // Logika filter country/region (Asia, Eropa, Amerika, Australia dan Oceania)
        if (country && country.length > 0) {
            whereClause.country = { [Op.in]: country };
        }

        // Logika filter level (S1, S2, S3)
        if (level && level.length > 0) {
            whereClause.level = { [Op.in]: level };
        }

        const optionsClause = {
            limit,
            offset: Helpers.setOffset(page, limit),
            order: [['open_date', 'DESC']]
        };

        const { rows, count } = await ScholarshipRepository.findAndCountAll(whereClause, optionsClause);
        if (count === 0) {
            return Response.formatServiceReturn(false, 404, null, language.SCHOLARSHIP.NOT_FOUND);
        }

        const data = { rows, count };
        return Response.formatServiceReturn(true, 200, data, language.SCHOLARSHIP.SUCCESS_LIST);
    } catch (error) {
        console.error('Error in getScholarshipListPublic service:', error);
        return Response.formatServiceReturn(false, 500, null, language.SCHOLARSHIP.FAILED_LIST);
    }
};

const createScholarship = async (input, opts = {}) => {
    const language = opts.lang;
    // Membungkus semua operasi database dalam satu transaksi
    return sequelize.transaction(async (trx) => {
        try {
            // 1. Pisahkan data untuk tabel utama dan tabel detail
            const scholarshipData = {
                scholarship_name: input.scholarship_name,
                open_date: input.open_date,
                closed_date: input.closed_date,
                level: input.level,
                type: input.type,
                country: input.country,
                university: input.university,
                status: input.status
            };

            const detailData = {
                description: input.description,
                requirement: input.requirement,
                benefit: input.benefit
            };

            // 2. Panggil repository untuk membuat data
            const created = await ScholarshipRepository.create(scholarshipData, detailData, trx);

            // 3. Ambil kembali data yang baru dibuat beserta detailnya untuk dikembalikan
            const newScholarship = await ScholarshipRepository.findOne({ uuid: created.uuid }, {}, trx);

            return Response.formatServiceReturn(true, 201, newScholarship, language.SCHOLARSHIP.CREATE_SUCCESS);
        } catch (error) {
            console.error('Error in createScholarship service:', error);
            // Jika ada error, transaksi akan otomatis di-rollback
            throw error; // Lempar error agar bisa ditangkap oleh catch di luar
        }
    }).catch((error) => {
        // Menangani error dari transaksi
        console.error('Error in internal service createScholarship :', error);
        return Response.formatServiceReturn(false, 500, null, language.SCHOLARSHIP.CREATE_FAILED);
    });
};

const updateScholarship = async (input, opts = {}) => {
    const language = opts.lang;
    return sequelize.transaction(async (trx) => {
        try {
            const { uuid } = input;

            // 1. Cek apakah beasiswa ada
            const scholarship = await ScholarshipRepository.findOne({ uuid }, {}, trx);
            if (!scholarship) {
                return Response.formatServiceReturn(false, 404, null, language.SCHOLARSHIP.NOT_FOUND);
            }

            // 2. Pisahkan data untuk update
            const scholarshipData = {
                scholarship_name: input.scholarship_name,
                open_date: input.open_date,
                closed_date: input.closed_date,
                level: input.level,
                type: input.type,
                country: input.country,
                university: input.university,
                status: input.status
            };
            const detailData = {
                description: input.description,
                requirement: input.requirement,
                benefit: input.benefit
            };

            // 3. Panggil repository untuk update kedua tabel
            await ScholarshipRepository.update(scholarshipData, { uuid }, trx);
            await ScholarshipRepository.updateDetails(detailData, { scholarship_id: uuid }, trx);

            // 4. Ambil data terbaru untuk dikembalikan
            const updatedScholarship = await ScholarshipRepository.findOne({ uuid }, {}, trx);

            return Response.formatServiceReturn(true, 200, updatedScholarship, language.SCHOLARSHIP.UPDATE_SUCCESS);
        } catch (error) {
            console.error('Error in updateScholarship service:', error);
            throw error;
        }
    }).catch((error) => {
        console.error('Error in internal server updateScholarship :', error);
        return Response.formatServiceReturn(false, 500, null, language.SCHOLARSHIP.UPDATE_FAILED);
    });
};

const deleteScholarship = async (input, opts = {}) => {
    const language = opts.lang;
    try {
        const { uuid } = input;
        const scholarship = await ScholarshipRepository.findOne({ uuid });
        if (!scholarship) {
            return Response.formatServiceReturn(false, 404, null, language.SCHOLARSHIP.NOT_FOUND);
        }

        await ScholarshipRepository.delete({ uuid });
        return Response.formatServiceReturn(true, 200, null, language.SCHOLARSHIP.DELETE_SUCCESS);
    } catch (error) {
        console.error('Error in deleteScholarship service:', error);
        return Response.formatServiceReturn(false, 500, null, language.SCHOLARSHIP.DELETE_FAILED);
    }
};

const getScholarshipFilterOptions = async (opts = {}) => {
    const language = opts.lang;
    try {
        // Ambil distinct values menggunakan GROUP BY
        const types = await ScholarshipRepository.findAll(
            { status: 1, type: { [Op.ne]: null } },
            {
                attributes: ['type'],
                group: ['type'],
                raw: true
            }
        );

        const countries = await ScholarshipRepository.findAll(
            { status: 1, country: { [Op.ne]: null } },
            {
                attributes: ['country'],
                group: ['country'],
                raw: true
            }
        );

        const levels = await ScholarshipRepository.findAll(
            { status: 1, level: { [Op.ne]: null } },
            {
                attributes: ['level'],
                group: ['level'],
                raw: true
            }
        );

        // Extract dan sort values
        const filterOptions = {
            types: types.map((t) => t.type).filter(Boolean).sort(),
            countries: countries.map((c) => c.country).filter(Boolean).sort(),
            levels: levels.map((l) => l.level).filter(Boolean).sort()
        };

        return Response.formatServiceReturn(true, 200, filterOptions, language.SCHOLARSHIP.SUCCESS_GET_FILTER_OPTIONS || 'Filter options retrieved successfully');
    } catch (error) {
        console.error('Error in getScholarshipFilterOptions service:', error);
        return Response.formatServiceReturn(false, 500, null, language.SCHOLARSHIP.FAILED_GET_FILTER_OPTIONS || 'Failed to retrieve filter options');
    }
};

module.exports = {
    createScholarship,
    updateScholarship,
    deleteScholarship,
    getScholarshipListAdmin,
    getScholarshipDetail,
    getScholarshipListPublic,
    getScholarshipFilterOptions
};
