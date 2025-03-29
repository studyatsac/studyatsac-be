exports.item = (data) => {
    const responseData = {
        uuid: data.uuid,
        name: data.eventName,
        date: data.eventDate,
        color: data.eventColor,
        order: data.eventOrder,
        description: data.description
    };

    return responseData;
};

module.exports = exports;
