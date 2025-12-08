const LeadSubmissionsRepository = require('../../repositories/mysql/lead_submissions');
const Response = require('../../utils/response');

const createLeadSubmission = async (input, opts = {}) => {
    const language = opts.lang;

    try {
        const {
            whatsapp_number,
            selected_program,
            source
        } = input;

        // Create lead submission
        const leadData = {
            whatsapp_number,
            selected_program,
            source,
            status: 'new',
            created_at: new Date()
        };

        const newLead = await LeadSubmissionsRepository.create(leadData);

        return Response.formatServiceReturn(true, 201, newLead, language.LEAD_SUBMISSIONS?.CREATE_SUCCESS || 'Lead submission created successfully');
    } catch (error) {
        console.error('Error in createLeadSubmission service:', error);
        return Response.formatServiceReturn(false, 500, null, language.INTERNAL_SERVER_ERROR);
    }
};

const getLeadSubmissions = async (filters, opts = {}) => {
    const language = opts.lang;
    const { page = 1, limit = 10 } = opts;

    try {
        const offset = (page - 1) * limit;

        const where = {};
        if (filters.status) where.status = filters.status;
        if (filters.source) where.source = filters.source;
        if (filters.whatsapp_number) where.whatsapp_number = filters.whatsapp_number;

        const result = await LeadSubmissionsRepository.findAndCountAll(where, {
            limit,
            offset,
            order: [['created_at', 'DESC']]
        });

        const pagination = {
            total: result.count,
            page,
            limit,
            totalPages: Math.ceil(result.count / limit)
        };

        return Response.formatServiceReturn(true, 200, result.rows, '', pagination);
    } catch (error) {
        console.error('Error in getLeadSubmissions service:', error);
        return Response.formatServiceReturn(false, 500, null, language.INTERNAL_SERVER_ERROR);
    }
};

const getLeadSubmissionById = async (id, opts = {}) => {
    const language = opts.lang;

    try {
        const lead = await LeadSubmissionsRepository.findOne({ id });

        if (!lead) {
            return Response.formatServiceReturn(false, 404, null, language.LEAD_SUBMISSIONS?.NOT_FOUND || 'Lead submission not found');
        }

        return Response.formatServiceReturn(true, 200, lead);
    } catch (error) {
        console.error('Error in getLeadSubmissionById service:', error);
        return Response.formatServiceReturn(false, 500, null, language.INTERNAL_SERVER_ERROR);
    }
};

const updateLeadSubmission = async (id, input, opts = {}) => {
    const language = opts.lang;

    try {
        const lead = await LeadSubmissionsRepository.findOne({ id });

        if (!lead) {
            return Response.formatServiceReturn(false, 404, null, language.LEAD_SUBMISSIONS?.NOT_FOUND || 'Lead submission not found');
        }

        const updateData = {
            ...input,
            updated_at: new Date()
        };

        await LeadSubmissionsRepository.update({ id }, updateData);

        const updatedLead = await LeadSubmissionsRepository.findOne({ id });

        return Response.formatServiceReturn(true, 200, updatedLead, language.LEAD_SUBMISSIONS?.UPDATE_SUCCESS || 'Lead submission updated successfully');
    } catch (error) {
        console.error('Error in updateLeadSubmission service:', error);
        return Response.formatServiceReturn(false, 500, null, language.INTERNAL_SERVER_ERROR);
    }
};

const deleteLeadSubmission = async (id, opts = {}) => {
    const language = opts.lang;

    try {
        const lead = await LeadSubmissionsRepository.findOne({ id });

        if (!lead) {
            return Response.formatServiceReturn(false, 404, null, language.LEAD_SUBMISSIONS?.NOT_FOUND || 'Lead submission not found');
        }

        await LeadSubmissionsRepository.delete({ id });

        return Response.formatServiceReturn(true, 200, null, language.LEAD_SUBMISSIONS?.DELETE_SUCCESS || 'Lead submission deleted successfully');
    } catch (error) {
        console.error('Error in deleteLeadSubmission service:', error);
        return Response.formatServiceReturn(false, 500, null, language.INTERNAL_SERVER_ERROR);
    }
};

module.exports = {
    createLeadSubmission,
    getLeadSubmissions,
    getLeadSubmissionById,
    updateLeadSubmission,
    deleteLeadSubmission
};
