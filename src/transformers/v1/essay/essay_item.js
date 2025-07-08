exports.essayItemItem = (data, isRestricted = true) => {
    if (!data) return null;

    return {
        uuid: data.uuid,
        number: data.number,
        topic: data.topic,
        description: data.description,
        ...(!isRestricted ? { systemPrompt: data.systemPrompt } : {})
    };
};

exports.essayItemList = (data, isRestricted = true) => {
    if (!data || !Array.isArray(data)) return null;

    return data.map((item) => exports.essayItemItem(item, isRestricted));
};

module.exports = exports;
