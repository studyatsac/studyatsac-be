const Language = require('../../../languages');
const RolesServices = require('../../../services/v1/roles');

exports.updateRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;
        const { description } = req.body;

        const lang = Language.getLanguage(req.locale);

        const result = await RolesServices.updateRole({
            uuid: id,
            name,
            description,
        }, { lang });

        if (!result.status) {
            return res.status(result.code).json({ message: result.message });
        }

        return res.status(result.code).json({ code: result.code, message: result.message, data: result.data });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = exports;
