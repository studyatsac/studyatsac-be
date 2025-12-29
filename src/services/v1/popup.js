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
 * @param {Object} input - Popup data (may include file)
 * @param {number} userId - User ID creating the popup
 * @param {Object} opts - Options (language)
 * @returns {Promise<Object>}
 */
const createPopup = async (input, userId, opts = {}) => {
    const language = opts.lang;
    const supabase = require('../../utils/supabase');
    const BUCKET_NAME = 'my-uploads';

    try {
        let imageUrl = null;

        // 1. Handle file upload if file is provided
        if (input.file) {
            // Create unique filename
            const uniqueFileName = `${Date.now()}-${input.file.originalname}`;
            const filePath = `popups/${uniqueFileName}`;

            // A. Upload file to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from(BUCKET_NAME)
                .upload(filePath, input.file.buffer, {
                    contentType: input.file.mimetype
                });

            if (uploadError) {
                console.error('Supabase Upload Error:', uploadError);
                return Response.formatServiceReturn(false, 500, null, language?.POPUP?.UPLOAD_FAILED || 'Failed to upload image');
            }

            // B. Get public URL
            const { data: publicUrlData } = supabase.storage
                .from(BUCKET_NAME)
                .getPublicUrl(filePath);

            if (!publicUrlData || !publicUrlData.publicUrl) {
                return Response.formatServiceReturn(false, 500, null, language?.POPUP?.GET_URL_FAILED || 'Failed to get image URL');
            }

            imageUrl = publicUrlData.publicUrl;
        } else if (input.image_url) {
            // If no file but image_url is provided (manual URL input)
            imageUrl = input.image_url;
        } else {
            // Neither file nor image_url provided
            return Response.formatServiceReturn(false, 400, null, 'Either file upload or image_url is required');
        }

        const popupData = {
            uuid: uuidv4(),
            title: input.title,
            description: input.description,
            image_url: imageUrl,
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
 * @param {Object} input - Update data including uuid (may include file)
 * @param {number} userId - User ID updating the popup
 * @param {Object} opts - Options (language)
 * @returns {Promise<Object>}
 */
const updatePopup = async (input, userId, opts = {}) => {
    const language = opts.lang;
    const supabase = require('../../utils/supabase');
    const BUCKET_NAME = 'my-uploads';

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
        if (input.link_url !== undefined) updateData.link_url = input.link_url;
        if (input.start_date !== undefined) updateData.start_date = input.start_date;
        if (input.end_date !== undefined) updateData.end_date = input.end_date;
        if (input.priority !== undefined) updateData.priority = input.priority;
        if (input.status !== undefined) updateData.status = input.status;

        // Handle file upload if new file is provided
        if (input.file) {
            // === DELETE OLD IMAGE IF EXISTS ===
            if (popup.image_url) {
                try {
                    // Extract file path from URL
                    // Example URL: https://<...>.supabase.co/storage/v1/object/public/my-uploads/popups/12345.jpg
                    // We need: 'popups/12345.jpg'
                    const oldFilePath = popup.image_url.split(`${BUCKET_NAME}/`)[1];

                    // Delete old file from Supabase Storage
                    const { error: deleteError } = await supabase.storage
                        .from(BUCKET_NAME)
                        .remove([oldFilePath]);

                    if (deleteError) {
                        // Log error but don't stop the process
                        console.error('Supabase Delete Error:', deleteError);
                    }
                } catch (e) {
                    console.error('Error parsing or deleting old file:', e.message);
                }
            }
            // === END DELETE OLD IMAGE ===

            // Upload new file
            const uniqueFileName = `${Date.now()}-${input.file.originalname}`;
            const newFilePath = `popups/${uniqueFileName}`;

            const { error: uploadError } = await supabase.storage
                .from(BUCKET_NAME)
                .upload(newFilePath, input.file.buffer, {
                    contentType: input.file.mimetype
                });

            if (uploadError) {
                console.error('Supabase Upload Error:', uploadError);
                return Response.formatServiceReturn(false, 500, null, language?.POPUP?.UPLOAD_FAILED || 'Failed to upload image');
            }

            const { data: publicUrlData } = supabase.storage
                .from(BUCKET_NAME)
                .getPublicUrl(newFilePath);

            if (!publicUrlData || !publicUrlData.publicUrl) {
                return Response.formatServiceReturn(false, 500, null, language?.POPUP?.GET_URL_FAILED || 'Failed to get image URL');
            }

            // Add new image URL to update data
            updateData.image_url = publicUrlData.publicUrl;
        } else if (input.image_url !== undefined) {
            // If manual URL is provided (not file upload)
            updateData.image_url = input.image_url;
        }

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
