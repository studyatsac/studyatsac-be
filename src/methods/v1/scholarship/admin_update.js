const ScholarshipService = require('../../../services/v1/scholarship');
const Language = require('../../../languages');

exports.updateScholarship = async (req, res) => {
    const lang = Language.getLanguage(req.locale);
    try {
        // Gabungkan uuid dari parameter dan data dari body
        const input = {
            uuid: req.params.id,
            ...req.body
        };

        console.log('Update Scholarship Input:', JSON.stringify(input, null, 2));

        const result = await ScholarshipService.updateScholarship(input, { lang });

        if (!result.status) {
            return res.status(result.code).json({ message: result.message });
        }

        return res.status(result.code).json({
            code: result.code,
            message: result.message,
            data: result.data
        });
    } catch (err) {
        console.error('Error in updateScholarship controller:', err);
        const errorMessage = (lang && lang.INTERNAL_SERVER_ERROR) ? lang.INTERNAL_SERVER_ERROR : 'Internal Server Error';
        return res.status(500).json({ message: errorMessage });
    }
};
