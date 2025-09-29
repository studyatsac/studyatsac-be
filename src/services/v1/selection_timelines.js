const SelectionTimelineRepository = require('../../repositories/mysql/selection_timeline');
const Helpers = require('../../utils/helpers');
const Response = require('../../utils/response');

const getListSelectionTimeline = async (input, opts = {}) => {
    const language = opts.lang;

    try {
        const { page, limit } = input;

        // Menentukan klausa WHERE (kondisi pencarian)
        const whereClause = {};

        // Menentukan opsi pencarian (paginasi, urutan)
        const optionsClause = {
            order: [['created_at', 'desc']],
            limit,
            offset: Helpers.setOffset(page, limit)
        };

        // Memanggil repository untuk mencari data dan menghitung total
        const { rows: selectionTimelines, count } = await SelectionTimelineRepository.findAndCountAll(whereClause, optionsClause);

        if (!selectionTimelines || selectionTimelines.length === 0) {
            return Response.formatServiceReturn(false, 404, null, language.SELECTION_TIMELINE.NOT_FOUND);
        }

        // Memformat data hasil
        const data = { rows: selectionTimelines, count };

        // Mengembalikan respons sukses
        return Response.formatServiceReturn(true, 200, data, language.SELECTION_TIMELINE.SUCCESS_LIST);
    } catch (error) {
        console.error('Error in getListSelectionTimeline service:', error);
        return Response.formatServiceReturn(false, 500, null, language.SELECTION_TIMELINE.FAILED_LIST);
    }
};

const getDetailSelectionTimeline = async (input, opts = {}) => {
    const language = opts.lang;

    try {
        const selectionTimeline = await SelectionTimelineRepository.findOne({ uuid: input.uuid });

        // Cek jika tidak ditemukan
        if (!selectionTimeline) {
            return Response.formatServiceReturn(false, 404, null, language.SELECTION_TIMELINE.NOT_FOUND);
        }

        // Mengembalikan respons sukses dengan detail
        return Response.formatServiceReturn(true, 200, selectionTimeline, language.SELECTION_TIMELINE.SUCCESS_GET_DETAIL);
    } catch (error) {
        console.error('Error in getDetailSelectionTimeline service:', error);
        return Response.formatServiceReturn(false, 500, null, language.SELECTION_TIMELINE.FAILED_GET_DETAIL);
    }
};

const createSelectionTimeline = async (input, opts = {}) => {
    const language = opts.lang || {}; // (Peningkatan #2) Pastikan language tidak null

    try {
        const { eventName, eventDate, eventColor, eventOrder, description } = input;

        const createData = {
            eventName,
            eventDate,
            eventColor,
            eventOrder,
            description,
        };

        console.log('Data yang dikirim ke Repository:', createData);
        // Membuat entri baru di database
        // Diasumsikan SelectionTimelineRepository.create() adalah synchronous, jika tidak tambahkan { opts }
        const newSelectionTimeline = await SelectionTimelineRepository.create(createData, opts);

        // Cek jika gagal dibuat (walaupun Sequelize.create jarang mengembalikan null)
        if (!newSelectionTimeline) {
            return Response.formatServiceReturn(false, 500, null, language.SELECTION_TIMELINE?.CREATE_FAILED);
        }

        return Response.formatServiceReturn(true, 201, newSelectionTimeline, language.SELECTION_TIMELINE?.CREATE_SUCCESS);
    } catch (error) {
        console.error('Error in createSelectionTimeline service:', error);

        // ----------------------------------------------------
        // (Perbaikan #1) Tangani Validation Error dari Sequelize
        // ----------------------------------------------------
        if (error.name === 'SequelizeValidationError' || error.name === 'SequelizeUniqueConstraintError') {
            // Mengembalikan 400 Bad Request
            return Response.formatServiceReturn(false, 400, null, error.message);
        }

        // Tangani semua error 500 lainnya
        return Response.formatServiceReturn(false, 500, null, language.SELECTION_TIMELINE?.CREATE_FAILED);
    }
};
const updateSelectionTimeline = async (input, opts = {}) => {
    const language = opts.lang;

    try {
        const selectionTimeline = await SelectionTimelineRepository.findOne({ uuid: input.uuid });
        if (!selectionTimeline) {
            return Response.formatServiceReturn(false, 404, null, language.SELECTION_TIMELINE.NOT_FOUND);
        }

        const updateData = {
            eventName: input.eventName,
            eventDate: input.eventDate,
            eventColor: input.eventColor,
            eventOrder: input.eventOrder,
            description: input.description
        };

        const [updatedRows] = await SelectionTimelineRepository.update(
            updateData,
            { uuid: input.uuid }
        );

        // Cek jika update gagal
        if (updatedRows === 0) {
            return Response.formatServiceReturn(false, 500, null, language.SELECTION_TIMELINE.UPDATE_FAILED);
        }

        const updatedSelectionTimeline = await SelectionTimelineRepository.findOne({ uuid: input.uuid });

        return Response.formatServiceReturn(true, 200, updatedSelectionTimeline, language.SELECTION_TIMELINE.UPDATE_SUCCESS);
    } catch (error) {
        console.error('Error in updateSelectionTimeline service:', error);
        return Response.formatServiceReturn(false, 500, null, language.SELECTION_TIMELINE.UPDATE_FAILED);
    }
};

const deleteSelectionTimeline = async (input, opts = {}) => {
    const language = opts.lang;

    try {
        const selectionTimeline = await SelectionTimelineRepository.findOne({ uuid: input.uuid });
        if (!selectionTimeline) {
            return Response.formatServiceReturn(false, 404, null, language.SELECTION_TIMELINE.NOT_FOUND);
        }

        // Menghapus entri di database
        const deletedRows = await SelectionTimelineRepository.delete({ uuid: input.uuid });

        if (deletedRows === 0) {
            // Walaupun sudah dicek di atas, ini bisa jadi fallback jika delete gagal
            return Response.formatServiceReturn(false, 500, null, language.SELECTION_TIMELINE.DELETE_FAILED);
        }

        // Mengembalikan respons sukses
        return Response.formatServiceReturn(true, 200, null, language.SELECTION_TIMELINE.DELETE_SUCCESS);
    } catch (error) {
        console.error('Error in deleteSelectionTimeline service:', error);
        return Response.formatServiceReturn(false, 500, null, language.SELECTION_TIMELINE.DELETE_FAILED);
    }
}

module.exports = {
    getListSelectionTimeline,
    getDetailSelectionTimeline,
    createSelectionTimeline,
    updateSelectionTimeline,
    deleteSelectionTimeline
};
