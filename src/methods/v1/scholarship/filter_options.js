const ScholarshipService = require('../../../services/v1/scholarship');
const Language = require('../../../languages');

exports.getScholarshipFilterOptions = async (req, res) => {
    let lang;
    try {
        lang = Language.getLanguage(req.locale);

        const result = await ScholarshipService.getScholarshipFilterOptions({ lang });

        if (!result.status) {
            return res.status(result.code).json({ message: result.message });
        }

        return res.status(200).json({
            code: result.code,
            messages: result.message,
            data: result.data
        });
    } catch (err) {
        console.error('Error in getScholarshipFilterOptions controller:', err);
        const errorMessage = (lang && lang.INTERNAL_SERVER_ERROR) ? lang.INTERNAL_SERVER_ERROR : 'Internal Server Error';
        return res.status(500).json({ message: errorMessage });
    }
};
