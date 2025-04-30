const RolesRepository = require('../../repositories/mysql/roles');

const getAllRoles = async () => {
    const roles = await RolesRepository.findAll();
    return roles.map(role => role.toJSON ? role.toJSON() : role);
};

module.exports = {
    getAllRoles
};
