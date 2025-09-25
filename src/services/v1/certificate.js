const certificateRepository = require('../../repositories/mysql/certificate');
const Response = require('../../utils/response');
const userExamRepository = require('../../repositories/mysql/user_exam');
const Models = require('../../models/mysql');

const generateCertificateCode = (type) => {
    // Contoh sederhana: SAC/TAHUN/ACAK
    const year = new Date().getFullYear();
    const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `SAC/${year}/${type.toUpperCase()}/${randomString}`;
};

const createCertificate = async (input, opts = {}) => {
    const language = opts.lang;

    try {
        const { user_exam_id, type } = input;

        // 1. Ambil data UserExam dari repository
        const userExamResult = await userExamRepository.findOne({ uuid: user_exam_id }, { include: ['User', 'Exam'] });

        if (!userExamResult) {
            return Response.formatServiceReturn(false, 404, null, language.CERTIFICATE.USER_EXAM_NOT_FOUND);
        }

        const { userId, examId, totalScore, User, Exam } = userExamResult;

        const existingCertificate = await certificateRepository.findOne ({
            user_id: userId,
            exam_id: examId
        });

        if (existingCertificate) {
            // Jika sertifikat sudah ada, kembalikan respons kesalahan
            const formattedResponse = {
                name: User.fullName,
                certificate_code: existingCertificate.certificate_code,
                type: existingCertificate.type,
                exam: {
                    exam_name: Exam.title,
                    score: totalScore
                }
            };
            return Response.formatServiceReturn(false, 409, formattedResponse, language.CERTIFICATE.ALREADY_EXISTS);
        }

        // 2. Buat certificate_code yang unik
        const certificateCode = generateCertificateCode(type);

        // 3. Siapkan data untuk disimpan di database
        const certificateData = {
            user_id: userId,
            exam_id: examId,
            certificate_code: certificateCode,
            type,
            created_at: new Date()
        };

        // 4. Panggil repository untuk menyimpan data sertifikat
        const newCertificate = await certificateRepository.create(certificateData);

        // 5. Format response sesuai permintaan
        const formattedResponse = {
            name: User.fullName, // Asumsi ada kolom 'name' di model User
            certificate_code: newCertificate.certificate_code,
            type: newCertificate.type,
            exam: {
                exam_name: Exam.title, // Asumsi ada kolom 'name' di model Exam
                score: totalScore
            }
        };

        const finalResult = Response.formatServiceReturn(true, 201, formattedResponse, language.CERTIFICATE.CREATE_SUCCESS);
        console.log('Final Result (Success):', finalResult); // --- Tambahan console.log di sini

        return finalResult;
    } catch (error) {
        console.error('Error in createCertificate service:', error); // Cetak error lengkap

        // Periksa apakah pesan error berasal dari asumsi yang salah
        if (error.message.includes('fullName') || error.message.includes('title')) {
            return Response.formatServiceReturn(false, 400, null, 'Property name or exam title not found. Please check your models.');
        }

        return Response.formatServiceReturn(false, 500, null, language.CERTIFICATE.FAILED_CREATE);
    }
};

const getAllCertificatesByUserId = async (userId, opts = {}) => {
    const language = opts.lang;

    try {
        const certificates = await certificateRepository.findAllByUserID(userId);

        if (!certificates || certificates.length === 0) {
            return Response.formatServiceReturn(false, 404, null, language.CERTIFICATE.NOT_FOUND);
        }

        // 1. Lakukan iterasi untuk setiap sertifikat
        const formattedCertificates = await Promise.all(certificates.map(async (certificate) => {
            // 2. Cari data UserExam berdasarkan user_id dan exam_id
            const userExam = await userExamRepository.findOne({
                userId: certificate.user_id,
                examId: certificate.exam_id
            }, { include: ['User', 'Exam'] });

            // 3. Format data sesuai yang kamu inginkan
            return {
                certificate_id: certificate.certificate_id,
                certificate_code: certificate.certificate_code,
                type: certificate.type,
                name: userExam.User ? userExam.User.fullName : null,
                exam_info: {
                    exam_name: userExam.Exam ? userExam.Exam.title : null,
                    score: userExam.totalScore
                },
                created_at: certificate.created_at
            };
        }));

        return Response.formatServiceReturn(true, 200, formattedCertificates, language.CERTIFICATE.SUCCESS_GET_DETAIL);
    } catch {
        return Response.formatServiceReturn(false, 500, null, language.CERTIFICATE.FAILED_GET_DETAIL);
    }
};

const getDetailCertificateById = async (certificateId, opts = {}) => {
    const language = opts.lang;

    try {
        // Ambil sertifikat beserta data user dan exam
        const certificate = await certificateRepository.findOneById(certificateId);


        if (!certificate) {
            return Response.formatServiceReturn(false, 404, null, language.CERTIFICATE.NOT_FOUND);
        }

        // Ambil data user_exam untuk mendapatkan skor
        const userExamResult = await userExamRepository.findOne({
            userId: certificate.user_id,
            examId: certificate.exam_id
        }, {
            include: ['User', 'Exam']
        });

        if (!userExamResult) {
            // Ini bisa terjadi jika data user_exam tidak ditemukan
            return Response.formatServiceReturn(false, 404, null, language.CERTIFICATE.USER_EXAM_NOT_FOUND);
        }

        // Format data yang akan dikembalikan
        const formattedData = {
            certificate_code: certificate.certificate_code,
            type: certificate.type, name: userExamResult.User ? userExamResult.User.fullName : null, // Mengakses data User dari UserExam
            exam_info: {
                exam_name: userExamResult.Exam ? userExamResult.Exam.title : null, // Mengakses data Exam dari UserExam
                score: userExamResult.totalScore, // Mengambil skor dari UserExam
            }
        };

        return Response.formatServiceReturn(true, 200, formattedData, language.CERTIFICATE.SUCCESS_GET_DETAIL);
    } catch {
        return Response.formatServiceReturn(false, 500, null, language.CERTIFICATE.FAILED_GET_DETAIL);
    }
};

const getListCertificates = async (input, opts = {}) => {
    const language = opts.lang || {};

    try {

        const { page, limit } = input;

        const { rows: certificates, count } = await certificateRepository.findAllAndCount(
            {},
            {
                limit,
                offset: (page - 1) * limit,
                include: [
                    { model: Models.User, as: 'user' },
                    { model: Models.Exam, as: 'exam' }
                ]
            }
        );

        if (!certificates || certificates.length === 0) {
            return Response.formatServiceReturn(false, 404, null, language.CERTIFICATE.NOT_FOUND);
        }

        const formattedCertificates = await Promise.all(certificates.map(async (certificate) => {
            const userExam = await userExamRepository.findOne({
                userId: certificate.user_id,
                examId: certificate.exam_id
            }, { include: ['User', 'Exam'] });

            if (!userExam) {
                return null; // or return a default object to be filtered later
            }

            return {
                certificate_id: certificate.certificate_id,
                certificate_code: certificate.certificate_code,
                type: certificate.type,
                user_info: {
                    name: userExam.User ? userExam.User.fullName : null,
                },
                exam_info: {
                    exam_name: userExam.Exam ? userExam.Exam.title : null,
                    score: userExam.totalScore
                },
                created_at: certificate.created_at
            };
        }));

        // Filter out any null values that were returned from the map
        const finalFormattedCertificates = formattedCertificates.filter(cert => cert !== null);

        return Response.formatServiceReturn(true, 200, {
            rows: finalFormattedCertificates,
            count
        }, language.CERTIFICATE?.SUCCESS_LIST || 'Success get list of certificates.');
    } catch (error) { // Tambahkan parameter error untuk debugging
        console.error('Error in getListCertificates:', error);
        // Sekarang language sudah bisa diakses di sini
        return Response.formatServiceReturn(false, 500, null, language.CERTIFICATE?.FAILED_LIST || 'Failed to get list of certificates.');
    }
};

const deleteCertificate = async (certificateId, opts = {}) => {
    const language = opts.lang || {};

    try {

        // 1. Cari sertifikat berdasarkan ID
        const certificate = await certificateRepository.findOneById(certificateId);

        if (!certificate) {
            return Response.formatServiceReturn(false, 404, null, language.CERTIFICATE.NOT_FOUND);
        }

        // 2. Hapus sertifikat
        await certificateRepository.delete({ certificate_id: certificateId });

        return Response.formatServiceReturn(true, 200, null, language.CERTIFICATE?.DELETE_SUCCESS || 'Certificate deleted successfully.');
    } catch (error) {
        console.error('Error in deleteCertificate service:', error);
        return Response.formatServiceReturn(false, 500, null, language.CERTIFICATE?.DELETE_FAILED || 'Failed to delete certificate.');
    }
};

module.exports = {
    createCertificate,
    getAllCertificatesByUserId,
    getDetailCertificateById,
    getListCertificates,
    deleteCertificate
};
