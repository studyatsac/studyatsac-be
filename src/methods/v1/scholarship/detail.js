const ScholarshipService = require('../../../services/v1/scholarship');
const Language = require('../../../languages');

exports.getScholarshipDetail = async (req, res) => {
    const lang = Language.getLanguage(req.locale);
    try {
        const result = await ScholarshipService.getScholarshipDetail({ uuid: req.params.id }, { lang });

        if (!result.status) {
            return res.status(result.code).json({ message: result.message });
        }

        return res.status(result.code).json({
            code: result.code,
            message: result.message,
            data: result.data
        });
    } catch (err) {
        console.error('Error in getScholarshipDetail controller:', err);
        const errorMessage = (lang && lang.INTERNAL_SERVER_ERROR) ? lang.INTERNAL_SERVER_ERROR : 'Internal Server Error';
        return res.status(500).json({ message: errorMessage });
    }
};
