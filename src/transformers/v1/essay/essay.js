const EssayItemTransformer = require('./essay_item');

exports.essayItem = (data, isRestricted = true) => {
    if (!data) return null;

    return {
        uuid: data.uuid,
        title: data.title,
        description: data.description,
        isActive: data.isActive,
        essayItems: EssayItemTransformer.essayItemList(data?.essayItems, isRestricted)
    };
};

exports.essayList = (data, isRestricted = true) => {
    if (!data || !Array.isArray(data)) return null;

    return data.map((item) => exports.essayItem(item, isRestricted)).filter(Boolean);
};

module.exports = exports;
