const certificateRepository = require('../../repositories/mysql/certificate');
const Response = require('../../utils/response');
const userExamRepository = require('../../repositories/mysql/user_exam');

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

        return Response.formatServiceReturn(true, 201, formattedResponse, language.CERTIFICATE.CREATE_SUCCESS);
    } catch {
        // Tangani error secara terpusat
        return Response.formatServiceReturn(false, 500, null, language.CERTIFICATE.FAILED_CREATE);
    }
};

module.exports = {
    createCertificate
};
