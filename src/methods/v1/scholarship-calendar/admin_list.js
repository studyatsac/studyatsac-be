const ScholarshipCalendarService = require('../../../services/v1/scholarship-calendar');
const Language = require('../../../languages');

exports.getScholarshipCalendarListAdmin = async (req, res) => {
    let lang;
    try {
        lang = Language.getLanguage(req.locale);

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const scholarship_id = req.query.scholarship_id ? parseInt(req.query.scholarship_id) : null;
        const event_type = req.query.event_type || null;
        const status = req.query.status || null;
        const search = req.query.search || null;
        const sort_by = req.query.sort_by || 'start_date';
        const sort_order = req.query.sort_order || 'asc';

        const input = {
            page, limit, scholarship_id, event_type, status, search, sort_by, sort_order
        };

        const result = await ScholarshipCalendarService.getScholarshipCalendarListAdmin(input, { lang });

        if (!result.status) {
            return res.status(result.code).json({
                success: false,
                message: result.message
            });
        }

        const { rows, count } = result.data;
        return res.status(200).json({
            success: true,
            message: result.message,
            data: {
                events: rows,
                pagination: {
                    current_page: page,
                    total_pages: Math.ceil(count / limit),
                    total_items: count,
                    items_per_page: limit,
                    has_next: page < Math.ceil(count / limit),
                    has_prev: page > 1
                }
            }
        });
    } catch (err) {
        console.error('Error in getScholarshipCalendarListAdmin controller:', err);
        const errorMessage = (lang && lang.INTERNAL_SERVER_ERROR) ? lang.INTERNAL_SERVER_ERROR : 'Internal Server Error';
        return res.status(500).json({ success: false, message: errorMessage });
    }
};
