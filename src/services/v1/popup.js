const { v4: uuidv4 } = require('uuid');
const PopupRepository = require('../../repositories/mysql/popup');
const Response = require('../../utils/response');
const Helpers = require('../../utils/helpers');

/**
 * Get active popup for public display
 * Returns highest priority active popup based on date and status
 * @param {Object} opts - Options (language)
 * @returns {Promise<Object>}
 */
const getActivePopup = async (opts = {}) => {
    const language = opts.lang;
    try {
        const popup = await PopupRepository.findActivePopup();

        if (!popup) {
            return Response.formatServiceReturn(true, 200, null, 'No active popup available');
        }

        // Return only necessary fields for public display
        const data = {
            uuid: popup.uuid,
            title: popup.title,
            image_url: popup.image_url,
            link_url: popup.link_url,
            priority: popup.priority
        };

        return Response.formatServiceReturn(true, 200, data, 'Active popup retrieved successfully');
    } catch (error) {
        console.error('Error in getActivePopup service:', error);
        return Response.formatServiceReturn(false, 500, null, language?.POPUP?.FAILED_GET || 'Failed to get active popup');
    }
};

/**
 * Get list of popups for admin (with pagination)
 * @param {Object} filters - Filter criteria (status, search)
 * @param {Object} pagination - Pagination params (page, limit, sort_by, sort_order)
 * @param {Object} opts - Options (language)
 * @returns {Promise<Object>}
 */
const getPopupList = async (filters = {}, pagination = {}, opts = {}) => {
    const language = opts.lang;
    try {
        const {
            page = 1, limit = 10, sort_by = 'created_at', sort_order = 'DESC'
        } = pagination;
        const offset = Helpers.setOffset(page, limit);

        const optionsClause = {
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [[sort_by, sort_order.toUpperCase()]]
        };

        const { rows, count } = await PopupRepository.findAndCountAll(filters, optionsClause);

        const data = {
            rows,
            count
        };

        return Response.formatServiceReturn(true, 200, data, 'Popup list retrieved successfully');
    } catch (error) {
        console.error('Error in getPopupList service:', error);
        return Response.formatServiceReturn(false, 500, null, language?.POPUP?.FAILED_LIST || 'Failed to get popup list');
    }
};

/**
 * Get popup detail by UUID
 * @param {Object} input - Input params (uuid)
 * @param {Object} opts - Options (language)
 * @returns {Promise<Object>}
 */
const getPopupDetail = async (input, opts = {}) => {
    const language = opts.lang;
    try {
        const { uuid } = input;
        const popup = await PopupRepository.findOne({ uuid });

        if (!popup) {
            return Response.formatServiceReturn(false, 404, null, 'Popup not found');
        }

        return Response.formatServiceReturn(true, 200, popup, 'Popup detail retrieved successfully');
    } catch (error) {
        console.error('Error in getPopupDetail service:', error);
        return Response.formatServiceReturn(false, 500, null, language?.POPUP?.FAILED_GET_DETAIL || 'Failed to get popup detail');
    }
};

/**
 * Create new popup
 * @param {Object} input - Popup data
 * @param {number} userId - User ID creating the popup
 * @param {Object} opts - Options (language)
 * @returns {Promise<Object>}
 */
const createPopup = async (input, userId, opts = {}) => {
    const language = opts.lang;
    try {
        const popupData = {
            uuid: uuidv4(),
            title: input.title,
            description: input.description,
            image_url: input.image_url,
            link_url: input.link_url,
            start_date: input.start_date || null,
            end_date: input.end_date || null,
            priority: input.priority !== undefined ? input.priority : 0,
            status: input.status !== undefined ? input.status : 1,
            created_by: userId,
            updated_by: userId
        };

        const popup = await PopupRepository.create(popupData);

        return Response.formatServiceReturn(true, 201, popup, 'Popup created successfully');
    } catch (error) {
        console.error('Error in createPopup service:', error);
        return Response.formatServiceReturn(false, 500, null, language?.POPUP?.CREATE_FAILED || 'Failed to create popup');
    }
};

/**
 * Update popup by UUID
 * @param {Object} input - Update data including uuid
 * @param {number} userId - User ID updating the popup
 * @param {Object} opts - Options (language)
 * @returns {Promise<Object>}
 */
const updatePopup = async (input, userId, opts = {}) => {
    const language = opts.lang;
    try {
        const { uuid } = input;

        // Check if popup exists
        const popup = await PopupRepository.findOne({ uuid });
        if (!popup) {
            return Response.formatServiceReturn(false, 404, null, 'Popup not found');
        }

        // Prepare update data (only include fields that are provided)
        const updateData = {
            updated_by: userId
        };

        if (input.title !== undefined) updateData.title = input.title;
        if (input.description !== undefined) updateData.description = input.description;
        if (input.image_url !== undefined) updateData.image_url = input.image_url;
        if (input.link_url !== undefined) updateData.link_url = input.link_url;
        if (input.start_date !== undefined) updateData.start_date = input.start_date;
        if (input.end_date !== undefined) updateData.end_date = input.end_date;
        if (input.priority !== undefined) updateData.priority = input.priority;
        if (input.status !== undefined) updateData.status = input.status;

        await PopupRepository.update(updateData, { uuid });

        // Fetch updated popup
        const updatedPopup = await PopupRepository.findOne({ uuid });

        return Response.formatServiceReturn(true, 200, updatedPopup, 'Popup updated successfully');
    } catch (error) {
        console.error('Error in updatePopup service:', error);
        return Response.formatServiceReturn(false, 500, null, language?.POPUP?.UPDATE_FAILED || 'Failed to update popup');
    }
};

/**
 * Delete popup by UUID (soft delete)
 * @param {Object} input - Input params (uuid)
 * @param {Object} opts - Options (language)
 * @returns {Promise<Object>}
 */
const deletePopup = async (input, opts = {}) => {
    const language = opts.lang;
    try {
        const { uuid } = input;

        // Check if popup exists
        const popup = await PopupRepository.findOne({ uuid });
        if (!popup) {
            return Response.formatServiceReturn(false, 404, null, 'Popup not found');
        }

        await PopupRepository.delete({ uuid });

        return Response.formatServiceReturn(true, 200, null, 'Popup deleted successfully');
    } catch (error) {
        console.error('Error in deletePopup service:', error);
        return Response.formatServiceReturn(false, 500, null, language?.POPUP?.DELETE_FAILED || 'Failed to delete popup');
    }
};

module.exports = {
    getActivePopup,
    getPopupList,
    getPopupDetail,
    createPopup,
    updatePopup,
    deletePopup
};
