const EssayItemTransformer = require('../essay/essay_item');

exports.userEssayItemItem = (data, isRestricted = true) => {
    if (!data) return null;

    return {
        uuid: data.uuid,
        essayItem: data.essayItem && EssayItemTransformer.essayItemItem(data.essayItem, isRestricted),
        answer: data.answer,
        review: data.review
    };
};

exports.userEssayItemList = (data, isRestricted = true) => {
    if (!data || !Array.isArray(data)) return null;

    return data.map((item) => exports.userEssayItemItem(item, isRestricted));
};

module.exports = exports;
