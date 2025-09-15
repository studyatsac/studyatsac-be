const Models = require('../../models/mysql');

exports.userHasRole = async function (userId, roleName) {
    const roleUser = await Models.RoleUser.findOne({
        where: { user_id: userId },
        include: [{
            model: Models.Role,
            where: { name: roleName }
        }]
    });
    return !!roleUser;
};

exports.findAndCountAll = function (where, opts = {}, trx = null) {
    return Models.RoleUser.findAndCountAll({ where, ...opts, transaction: trx });
};

exports.findOne = function (where, opts = {}, trx = null) {
    return Models.RoleUser.findOne({ where, ...opts, transaction: trx });
};

exports.create = function (data, opts = {}, trx = null) {
    return Models.RoleUser.create(data, { ...opts, transaction: trx });
};

exports.update = function (payload, where, trx = null) {
    return Models.RoleUser.update(payload, {where, transaction: trx });
};

exports.delete = function (where, trx = null) {
    return Models.RoleUser.destroy({ where, transaction: trx });
};
module.exports = exports;
