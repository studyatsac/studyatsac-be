const Language = require('../../../languages');
const RolesServices = require('../../../services/v1/roles');

exports.createRole = async (req, res) => {
    try {
        const { name, description } = req.body;

        const lang = Language.getLanguage(req.locale);

        const result = await RolesServices.createRole({
            name,
            description
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
