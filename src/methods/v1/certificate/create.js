const certificateService = require('../../../services/v1/certificate');
const Language = require('../../../languages');

exports.createCertificate = async (req, res) => {
    try {
        const { user_exam_id, type } = req.body;

        // Asumsi: Kamu memiliki helper untuk mendapatkan bahasa
        const lang = Language.getLanguage(req.locale);

        if (!user_exam_id || !type) {
            return res.status(400).json({ message: 'User Exam ID and type are required.' });
        }

        const result = await certificateService.createCertificate({ user_exam_id, type }, { lang });

        if (!result.status) {
            return res.status(result.code).json({ message: result.message });
        }

        return res.status(result.code).json({
            code: result.code,
            message: result.message,
            data: result.data
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = exports;
