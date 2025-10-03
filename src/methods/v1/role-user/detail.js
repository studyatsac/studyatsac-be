const RolesUserService = require('../../../services/v1/role_user');

exports.getDetailUser = async (req, res) => {
    try {
        const { uuid } = req.params;

        const user = await RolesUserService.getUserWithRoles(uuid);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Respons JSON dengan data pengguna dan perannya
        return res.status(200).json({
            message: 'Successfully retrieved user details.',
            data: user
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};
