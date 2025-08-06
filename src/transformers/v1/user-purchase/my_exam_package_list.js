exports.item = (data) => ({
  uuid: data.ExamPackage?.uuid, // Ambil dari relasi
  title: data.ExamPackage?.title,
  category: (data.category || []).map((category) => ({
    uuid: category.uuid,
    title: category.title,
  })),
});

module.exports = exports;
