const ScholarshipCalendarService = require('../../../services/v1/scholarship-calendar');
const Language = require('../../../languages');

exports.getScholarshipCalendarDetailAdmin = async (req, res) => {
    const lang = Language.getLanguage(req.locale);
    try {
        const id = parseInt(req.params.id);
        const input = { id };

        const result = await ScholarshipCalendarService.getScholarshipCalendarDetailAdmin(input, { lang });

        if (!result.status) {
            return res.status(result.code).json({
                success: false,
                message: result.message,
                data: null
            });
        }

        return res.status(200).json({
            success: true,
            message: result.message,
            data: result.data
        });
    } catch (err) {
        console.error('Error in getScholarshipCalendarDetailAdmin controller:', err);
        const errorMessage = (lang && lang.INTERNAL_SERVER_ERROR) ? lang.INTERNAL_SERVER_ERROR : 'Internal Server Error';
        return res.status(500).json({ success: false, message: errorMessage });
    }
};
