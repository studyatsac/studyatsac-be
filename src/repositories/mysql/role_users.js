const Models = require('../../models/mysql');

exports.userHasRole = async function (userId, roleName) {
    const roleUser = await Models.RoleUser.findOne({
        where: { user_id: userId },
        include: [{
            model: Models.Role,
            where: { name: roleName },
        }],
    });
    return !!roleUser;
};

module.exports = exports;
