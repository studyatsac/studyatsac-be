exports.item = (data) => {
    const responseData = {
        uuid: data.uuid,
        title: data.eventTitle,
        type: data.eventType,
        url: data.url,
        host: data.eventHost,
        platform: data.eventPlatform,
        startDate: data.startDate,
        endDate: data.endDate
    };

    return responseData;
};

module.exports = exports;
