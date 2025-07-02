exports.essayItemItem = (data) => {
    if (!data) return null;

    return {
        uuid: data.uuid,
        number: data.number,
        topic: data.topic,
        description: data.description,
        systemPrompt: data.systemPrompt
    };
};

exports.essayItemList = (data) => {
    if (!data || !Array.isArray(data)) return null;

    return data.map(exports.essayItemItem);
};

module.exports = exports;
