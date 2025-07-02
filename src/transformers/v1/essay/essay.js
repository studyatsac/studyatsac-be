exports.essayItem = (data) => {
    if (!data) return null;

    return {
        uuid: data.uuid,
        title: data.title,
        description: data.description,
        isActive: data.isActive
    };
};

exports.essayList = (data) => {
    if (!data || !Array.isArray(data)) return null;

    return data.map(exports.essayItem);
};

module.exports = exports;
