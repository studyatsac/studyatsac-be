const ScholarshipCalendarRepository = require('../../repositories/mysql/scholarship-calendar');
const Response = require('../../utils/response');

const getScholarshipCalendarByMonth = async (input, opts = {}) => {
    const language = opts.lang;
    try {
        const {
            month, year, scholarship_id, level, type, country, status
        } = input;

        // Validate required parameters
        if (!month || !year) {
            return Response.formatServiceReturn(false, 400, null, 'Month and year are required for calendar view');
        }

        const filters = {};
        if (scholarship_id) filters.uuid = scholarship_id;
        if (level) filters.level = level;
        if (type) filters.type = type;
        if (country) filters.country = country;
        if (status) filters.status = status;

        const scholarships = await ScholarshipCalendarRepository.findByMonth(
            parseInt(month),
            parseInt(year),
            filters,
            { order: [['open_date', 'ASC']] }
        );

        const data = {
            month: `${year}-${String(month).padStart(2, '0')}`,
            year: parseInt(year),
            scholarships,
            total_scholarships: scholarships.length
        };

        return Response.formatServiceReturn(true, 200, data, 'Scholarship calendar retrieved successfully');
    } catch (error) {
        console.error('Error in getScholarshipCalendarByMonth service:', error);
        return Response.formatServiceReturn(false, 500, null, 'Failed to retrieve scholarship calendar');
    }
};

module.exports = {
    getScholarshipCalendarByMonth
};
