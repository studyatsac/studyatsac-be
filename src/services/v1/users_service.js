const Models = require("../../models/mysql");

exports.getAllUsers = async function (opts = {}, trx = null) {
  return Models.User.findAndCountAll({
    attributes: ['id', 'uuid', 'fullName', 'email', 'institutionName', 'faculty', 'nip', 'created_at'],
    ...opts,
    transaction: trx,
  });
};

// Membuat user baru
exports.createUser = async function (userData, trx = null) {
  return Models.User.create(userData, { transaction: trx });
};

// Menghapus user berdasarkan id
exports.deleteUser = async function (userId, trx = null) {
  return Models.User.destroy({ where: { id: userId }, transaction: trx });
};

// Bulk delete users berdasarkan array id
exports.bulkDeleteUsers = async function (userIds, trx = null) {
  return Models.User.destroy({ where: { id: userIds }, transaction: trx });
};
