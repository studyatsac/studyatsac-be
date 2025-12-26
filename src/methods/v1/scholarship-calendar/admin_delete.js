const ScholarshipCalendarService = require('../../../services/v1/scholarship-calendar');
const Language = require('../../../languages');

exports.deleteScholarshipCalendar = async (req, res) => {
    const lang = Language.getLanguage(req.locale);
    try {
        const id = parseInt(req.params.id);
        const input = { id };

        const result = await ScholarshipCalendarService.deleteScholarshipCalendar(input, { lang });

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
            data: null
        });
    } catch (err) {
        console.error('Error in deleteScholarshipCalendar controller:', err);
        const errorMessage = (lang && lang.INTERNAL_SERVER_ERROR) ? lang.INTERNAL_SERVER_ERROR : 'Internal Server Error';
        return res.status(500).json({ success: false, message: errorMessage });
    }
};
