const { Op } = require('sequelize');
const ScholarshipCalendarRepository = require('../../repositories/mysql/scholarship-calendar');
const { sequelize } = require('../../models/mysql');
const Helpers = require('../../utils/helpers');
const Response = require('../../utils/response');

const getScholarshipCalendarList = async (input, opts = {}) => {
    const language = opts.lang;
    try {
        const {
            page, limit, scholarship_id, event_type, status, start_date, end_date, search
        } = input;
        const whereClause = {};

        // Apply filters
        if (scholarship_id) whereClause.scholarship_id = scholarship_id;
        if (event_type) whereClause.event_type = event_type;
        if (status) whereClause.status = status;
        if (search) {
            whereClause[Op.or] = [
                { title: { [Op.like]: `%${search}%` } },
                { description: { [Op.like]: `%${search}%` } }
            ];
        }
        if (start_date) {
            whereClause.start_date = { [Op.gte]: new Date(start_date) };
        }
        if (end_date) {
            whereClause.end_date = { [Op.lte]: new Date(end_date) };
        }

        const optionsClause = {
            limit,
            offset: Helpers.setOffset(page, limit),
            order: [['start_date', 'ASC']]
        };

        const { rows, count } = await ScholarshipCalendarRepository.findAndCountAll(whereClause, optionsClause);

        const data = { rows, count };
        return Response.formatServiceReturn(true, 200, data, 'Scholarship calendar retrieved successfully');
    } catch (error) {
        console.error('Error in getScholarshipCalendarList service:', error);
        return Response.formatServiceReturn(false, 500, null, 'Failed to retrieve scholarship calendar');
    }
};

const getScholarshipCalendarByMonth = async (input, opts = {}) => {
    const language = opts.lang;
    try {
        const {
            month, year, scholarship_id, event_type, status
        } = input;

        // Validate required parameters
        if (!month || !year) {
            return Response.formatServiceReturn(false, 400, null, 'Month and year are required for calendar view');
        }

        const filters = {};
        if (scholarship_id) filters.scholarship_id = scholarship_id;
        if (event_type) filters.event_type = event_type;
        if (status) filters.status = status;

        const events = await ScholarshipCalendarRepository.findByMonth(
            parseInt(month),
            parseInt(year),
            filters,
            { order: [['start_date', 'ASC']] }
        );

        const data = {
            month: `${year}-${String(month).padStart(2, '0')}`,
            year: parseInt(year),
            events,
            total_events: events.length
        };

        return Response.formatServiceReturn(true, 200, data, 'Scholarship calendar retrieved successfully');
    } catch (error) {
        console.error('Error in getScholarshipCalendarByMonth service:', error);
        return Response.formatServiceReturn(false, 500, null, 'Failed to retrieve scholarship calendar');
    }
};

const getScholarshipCalendarDetail = async (input, opts = {}) => {
    const language = opts.lang;
    try {
        const event = await ScholarshipCalendarRepository.findOne({ id: input.id });
        if (!event) {
            return Response.formatServiceReturn(false, 404, null, 'Scholarship calendar event not found');
        }
        return Response.formatServiceReturn(true, 200, event, 'Scholarship calendar event retrieved successfully');
    } catch (error) {
        console.error('Error in getScholarshipCalendarDetail service:', error);
        return Response.formatServiceReturn(false, 500, null, 'Failed to retrieve scholarship calendar event');
    }
};

const getScholarshipCalendarListAdmin = async (input, opts = {}) => {
    const language = opts.lang;
    try {
        const {
            page, limit, scholarship_id, event_type, status, search, sort_by, sort_order
        } = input;
        const whereClause = {};

        // Apply filters
        if (scholarship_id) whereClause.scholarship_id = scholarship_id;
        if (event_type) whereClause.event_type = event_type;
        if (status) whereClause.status = status;
        if (search) {
            whereClause[Op.or] = [
                { title: { [Op.like]: `%${search}%` } },
                { description: { [Op.like]: `%${search}%` } }
            ];
        }

        const sortField = sort_by || 'start_date';
        const sortDirection = sort_order || 'asc';

        const optionsClause = {
            limit,
            offset: Helpers.setOffset(page, limit),
            order: [[sortField, sortDirection.toUpperCase()]]
        };

        const { rows, count } = await ScholarshipCalendarRepository.findAndCountAll(whereClause, optionsClause);

        const data = { rows, count };
        return Response.formatServiceReturn(true, 200, data, 'Scholarship calendar retrieved successfully');
    } catch (error) {
        console.error('Error in getScholarshipCalendarListAdmin service:', error);
        return Response.formatServiceReturn(false, 500, null, 'Failed to retrieve scholarship calendar');
    }
};

const getScholarshipCalendarDetailAdmin = async (input, opts = {}) => getScholarshipCalendarDetail(input, opts);

const createScholarshipCalendar = async (input, opts = {}) => {
    const language = opts.lang;
    return sequelize.transaction(async (trx) => {
        try {
            // Validate end_date > start_date
            if (new Date(input.end_date) <= new Date(input.start_date)) {
                return Response.formatServiceReturn(false, 400, null, 'End date must be after start date');
            }

            const data = {
                scholarship_id: input.scholarship_id,
                title: input.title,
                description: input.description || null,
                start_date: input.start_date,
                end_date: input.end_date,
                registration_deadline: input.registration_deadline || null,
                announcement_date: input.announcement_date || null,
                event_type: input.event_type || 'other',
                location: input.location || null,
                is_online: input.is_online !== undefined ? input.is_online : false,
                url: input.url || null,
                status: input.status || 'upcoming'
            };

            const created = await ScholarshipCalendarRepository.create(data, trx);
            const newEvent = await ScholarshipCalendarRepository.findOne({ id: created.id }, {}, trx);

            return Response.formatServiceReturn(true, 201, newEvent, 'Scholarship calendar event created successfully');
        } catch (error) {
            console.error('Error in createScholarshipCalendar service:', error);
            throw error;
        }
    }).catch((error) => {
        console.error('Error in internal service createScholarshipCalendar:', error);
        if (error.name === 'SequelizeForeignKeyConstraintError') {
            return Response.formatServiceReturn(false, 400, null, 'Invalid scholarship_id');
        }
        return Response.formatServiceReturn(false, 500, null, 'Failed to create scholarship calendar event');
    });
};

const updateScholarshipCalendar = async (input, opts = {}) => {
    const language = opts.lang;
    return sequelize.transaction(async (trx) => {
        try {
            const { id } = input;

            const event = await ScholarshipCalendarRepository.findOne({ id }, {}, trx);
            if (!event) {
                return Response.formatServiceReturn(false, 404, null, 'Scholarship calendar event not found');
            }

            // Validate end_date > start_date if both are provided
            const startDate = input.start_date || event.start_date;
            const endDate = input.end_date || event.end_date;
            if (new Date(endDate) <= new Date(startDate)) {
                return Response.formatServiceReturn(false, 400, null, 'End date must be after start date');
            }

            const data = {};
            if (input.scholarship_id !== undefined) data.scholarship_id = input.scholarship_id;
            if (input.title !== undefined) data.title = input.title;
            if (input.description !== undefined) data.description = input.description;
            if (input.start_date !== undefined) data.start_date = input.start_date;
            if (input.end_date !== undefined) data.end_date = input.end_date;
            if (input.registration_deadline !== undefined) data.registration_deadline = input.registration_deadline;
            if (input.announcement_date !== undefined) data.announcement_date = input.announcement_date;
            if (input.event_type !== undefined) data.event_type = input.event_type;
            if (input.location !== undefined) data.location = input.location;
            if (input.is_online !== undefined) data.is_online = input.is_online;
            if (input.url !== undefined) data.url = input.url;
            if (input.status !== undefined) data.status = input.status;

            await ScholarshipCalendarRepository.update(data, { id }, trx);
            const updatedEvent = await ScholarshipCalendarRepository.findOne({ id }, {}, trx);

            return Response.formatServiceReturn(true, 200, updatedEvent, 'Scholarship calendar event updated successfully');
        } catch (error) {
            console.error('Error in updateScholarshipCalendar service:', error);
            throw error;
        }
    }).catch((error) => {
        console.error('Error in internal server updateScholarshipCalendar:', error);
        if (error.name === 'SequelizeForeignKeyConstraintError') {
            return Response.formatServiceReturn(false, 400, null, 'Invalid scholarship_id');
        }
        return Response.formatServiceReturn(false, 500, null, 'Failed to update scholarship calendar event');
    });
};

const deleteScholarshipCalendar = async (input, opts = {}) => {
    const language = opts.lang;
    try {
        const { id } = input;
        const event = await ScholarshipCalendarRepository.findOne({ id });
        if (!event) {
            return Response.formatServiceReturn(false, 404, null, 'Scholarship calendar event not found');
        }

        await ScholarshipCalendarRepository.delete({ id });
        return Response.formatServiceReturn(true, 200, null, 'Scholarship calendar event deleted successfully');
    } catch (error) {
        console.error('Error in deleteScholarshipCalendar service:', error);
        return Response.formatServiceReturn(false, 500, null, 'Failed to delete scholarship calendar event');
    }
};

module.exports = {
    getScholarshipCalendarList,
    getScholarshipCalendarByMonth,
    getScholarshipCalendarDetail,
    getScholarshipCalendarListAdmin,
    getScholarshipCalendarDetailAdmin,
    createScholarshipCalendar,
    updateScholarshipCalendar,
    deleteScholarshipCalendar
};
