exports.item = (data) => ({
  uuid: data.uuid ?? null,
  title: data.title || "",
  category: Array.isArray(data.categories)
    ? data.categories.map((category) => ({
        uuid: category?.uuid || "",
        title: category?.title || "",
      }))
    : [],
});

module.exports = exports;
