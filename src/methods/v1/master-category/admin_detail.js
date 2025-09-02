const MasterCategoryServices = require('../../../services/v1/master_category');

exports.getDetailMasterCategory = async (req, res) => {
    try {
        const { uuid } = req.params;

        const result = await MasterCategoryServices.getDetailCategory({
            uuid
        }, { lang: req.lang });

        if (!result.success) {
            return res.status(result.code).json({ message: result.message });
        }

        return res.status(result.code).json({ data: result.data });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = exports;
