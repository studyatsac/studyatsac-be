const MasterCategoryServices = require('../../../services/v1/master_category');
const Language = require('../../../languages');

exports.createMasterCategory = async (req, res) => {
    try {
        const { title } = req.body;

        const lang = Language.getLanguage(req.locale);

        const result = await MasterCategoryServices.createCategory({
            title
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
