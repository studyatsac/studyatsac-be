const Language = require('../../../languages');
const RolesUserService = require('../../../services/role_user');

exports.assignRoleToUser = async (req, res) => {
    try {
        const { userUuid, roleUuid } = req.body;
        const lang = Language.getLanguage(req.locale);

        const result = await RolesUserService.assignRoleToUser({
            userUuid,
            roleUuid
        }, { lang });

        if (!result.status) {
            return res.status(result.code).json({ message: result.message });
        }

        return res.status(result.code).json({
            code: result.code,
            message: result.message,
            data: result.data
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};
