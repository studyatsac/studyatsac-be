exports.item = (data) => ({
    uuid: data.uuid,
    title: data.title,
    category: data.categories.map((category) => ({
        uuid: category.uuid,
        title: category.title
    }))
});

module.exports = exports;
