const uniqInputEssayItems = (essayItems) => {
    const essayItemUuids = [];
    const newEssayItems = [];
    essayItems?.forEach((essayItem) => {
        if (essayItemUuids.includes(essayItem.essayItemUuid)) return;

        newEssayItems.push(essayItem);
        essayItemUuids.push(essayItem.essayItemUuid);
    });

    return newEssayItems;
};

exports.uniqInputEssayItems = uniqInputEssayItems;

module.exports = exports;
