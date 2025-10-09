const ScholarshipService = require('../../../services/v1/scholarship');
const Language = require('../../../languages');

exports.createScholarship = async (req, res) => {
    const lang = Language.getLanguage(req.locale);
    try {
        // Mengambil semua data yang dibutuhkan dari body
        const result = await ScholarshipService.createScholarship(req.body, { lang });

        if (!result.status) {
            return res.status(result.code).json({ message: result.message });
        }

        return res.status(result.code).json({
            code: result.code,
            message: result.message,
            data: result.data
        });
    } catch (err) {
        console.error('Error in createScholarship controller:', err);
        const errorMessage = (lang && lang.INTERNAL_SERVER_ERROR) ? lang.INTERNAL_SERVER_ERROR : 'Internal Server Error';
        return res.status(500).json({ message: errorMessage });
    }
};
