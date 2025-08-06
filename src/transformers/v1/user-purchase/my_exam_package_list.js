exports.item = (data) => ({
  uuid: data.ExamPackage?.uuid,
  title: data.ExamPackage?.title,
  category: (data.categories || []).map((category) => ({
    uuid: category.uuid,
    title: category.title,
  })),
});

module.exports = exports;
