const SelectionTimelineRepository = require('../../repositories/mysql/selection_timeline');
const EventUpdateRepository = require('../../repositories/mysql/event_update');
const Response = require('../../utils/response');

const getSelectionTimeline = async (input, opts = {}) => {
    const options = {
        order: [['event_order', 'ASC']],
        limit: 50
    };

    const selectionTimelines = await SelectionTimelineRepository.findAll({}, options);

    // TODO: CACHE

    return Response.formatServiceReturn(true, 200, selectionTimelines, null);
};

const getEventUpdate = async (input, opts = {}) => {
    const options = {
        order: [['created_at', 'DESC']],
        limit: 100
    };

    const eventUpdates = await EventUpdateRepository.findAll({}, options);

    // TODO: CACHE

    return Response.formatServiceReturn(true, 200, eventUpdates, null);
};

exports.getSelectionTimeline = getSelectionTimeline;
exports.getEventUpdate = getEventUpdate;

module.exports = exports;
