const ScholarshipCalendarService = require('../../../services/v1/scholarship-calendar');
const Language = require('../../../languages');

exports.getScholarshipCalendarByMonth = async (req, res) => {
    let lang;
    try {
        lang = Language.getLanguage(req.locale);

        const month = req.query.month || null;
        const year = req.query.year || null;
        const scholarship_id = req.query.scholarship_id || null;
        const level = req.query.level || null;
        const type = req.query.type || null;
        const country = req.query.country || null;
        const status = req.query.status ? parseInt(req.query.status) : null;

        const input = {
            month, year, scholarship_id, level, type, country, status
        };

        const result = await ScholarshipCalendarService.getScholarshipCalendarByMonth(input, { lang });

        if (!result.status) {
            return res.status(result.code).json({
                success: false,
                message: result.message,
                errors: result.code === 400 ? {
                    month: !month ? ['Month is required for calendar view'] : [],
                    year: !year ? ['Year is required for calendar view'] : []
                } : undefined
            });
        }

        return res.status(200).json({
            success: true,
            message: result.message,
            data: result.data
        });
    } catch (err) {
        console.error('Error in getScholarshipCalendarByMonth controller:', err);
        const errorMessage = (lang && lang.INTERNAL_SERVER_ERROR) ? lang.INTERNAL_SERVER_ERROR : 'Internal Server Error';
        return res.status(500).json({ success: false, message: errorMessage });
    }
};
