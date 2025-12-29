const LeadSubmissionsService = require('../../../services/v1/lead-submissions');
const Language = require('../../../languages');
const LogUtils = require('../../../utils/logger');

let lang;

exports.getLeadSubmissions = async (req, res) => {
    try {
        lang = Language.getLanguage(req.locale);

        const {
            page = 1,
            limit = 10,
            status,
            source,
            whatsapp_number,
            search,
            order = 'desc',
            orderBy = 'created_at'
        } = req.query;

        const filters = {};
        if (status) filters.status = status;
        if (source) filters.source = source;
        if (whatsapp_number) filters.whatsapp_number = whatsapp_number;
        if (search) filters.search = search;

        const result = await LeadSubmissionsService.getLeadSubmissions(filters, {
            page: parseInt(page),
            limit: parseInt(limit),
            order,
            orderBy,
            lang
        });

        if (!result.status) {
            return res.status(result.code).json({ message: result.message });
        }

        // Ensure pagination exists with default values
        const pagination = result.pagination || {
            total: 0,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: 0
        };

        return res.status(200).json({
            data: result.data || [],
            meta: {
                total_data: pagination.total,
                page: pagination.page,
                limit: pagination.limit,
                total_pages: pagination.totalPages
            },
            message: ''
        });
    } catch (err) {
        LogUtils.logError({
            functionName: 'getLeadSubmissions',
            message: err.message
        });

        return res.status(500).json({ message: lang.INTERNAL_SERVER_ERROR });
    }
};

exports.getLeadSubmissionById = async (req, res) => {
    try {
        lang = Language.getLanguage(req.locale);

        const { id } = req.params;

        const result = await LeadSubmissionsService.getLeadSubmissionById(id, { lang });

        if (!result.status) {
            return res.status(result.code).json({ message: result.message });
        }

        return res.status(200).json({
            data: result.data,
            message: ''
        });
    } catch (err) {
        LogUtils.logError({
            functionName: 'getLeadSubmissionById',
            message: err.message
        });

        return res.status(500).json({ message: lang.INTERNAL_SERVER_ERROR });
    }
};

module.exports = exports;
