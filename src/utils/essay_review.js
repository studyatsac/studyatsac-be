const uniqEssayItems = (essayItems) => {
    const essayItemUuids = [];
    const newEssayItems = [];
    essayItems?.forEach((essayItem) => {
        if (essayItemUuids.includes(essayItem.uuid)) return;

        newEssayItems.push(essayItem);
        essayItemUuids.push(essayItem.uuid);
    });

    return newEssayItems;
};

exports.uniqEssayItems = uniqEssayItems;

module.exports = exports;
