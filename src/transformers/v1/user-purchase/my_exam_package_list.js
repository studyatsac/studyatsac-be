exports.item = (data) => ({
  uuid: data.ExamPackage?.uuid,
  title: data.ExamPackage?.title,
  category: (data.category || []).map((category) => ({
    uuid: category.uuid,
    title: category.title
  }))
});

module.exports = exports;
