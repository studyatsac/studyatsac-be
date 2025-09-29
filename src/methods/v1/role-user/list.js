const RolesUserService = require('../../../services/v1/role_user');

exports.getListUsersWithRoles = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const result = await RolesUserService.getListUsersWithRoles({
            page: parseInt(page),
            limit: parseInt(limit)
        });

        // Respons JSON dengan data pengguna dan perannya
        return res.status(200).json({
            message: result.message,
            data: result.rows,
            meta: {
                page: parseInt(page),
                limit: parseInt(limit),
                total_data: result.count,
                total_page: Math.ceil(result.count / limit)
            }
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};
