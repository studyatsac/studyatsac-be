const RolesService = require('../../../services/v1/roles');

module.exports = {
    async getAll(req, res) {
        try {
            const roles = await RolesService.getAllRoles();
            return res.status(200).json({ data: roles });
        } catch (err) {
            return res.status(500).json({ message: err.message });
        }
    }
};
