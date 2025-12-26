const ScholarshipCalendarService = require('../../../services/v1/scholarship-calendar');
const Language = require('../../../languages');
const validator = require('../../../validations/v1/scholarship-calendar/create');

exports.createScholarshipCalendar = async (req, res) => {
    const lang = Language.getLanguage(req.locale);
    try {
        // Validate request body
        const schema = validator(lang);
        const { error, value } = schema.validate(req.body);

        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation error',
                errors: { validation: [error.message] }
            });
        }

        const result = await ScholarshipCalendarService.createScholarshipCalendar(value, { lang });

        if (!result.status) {
            return res.status(result.code).json({
                success: false,
                message: result.message,
                data: null
            });
        }

        return res.status(201).json({
            success: true,
            message: result.message,
            data: result.data
        });
    } catch (err) {
        console.error('Error in createScholarshipCalendar controller:', err);
        const errorMessage = (lang && lang.INTERNAL_SERVER_ERROR) ? lang.INTERNAL_SERVER_ERROR : 'Internal Server Error';
        return res.status(500).json({ success: false, message: errorMessage });
    }
};
