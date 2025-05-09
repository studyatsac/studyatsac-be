const ListValidation = require('../../../validations/custom/list');
const MasterCategoryService = require('../../../services/v1/master_category');
const CategoryTransformer = require('../../../transformers/v1/category/list');
const Language = require('../../../languages');
const LogUtils = require('../../../utils/logger');

let lang;

exports.getListCategory = async (req, res) => {
    try {
        const { query } = req;

        lang = Language.getLanguage(req.locale);

        let input;

        try {
            input = await ListValidation(lang).validateAsync(query);
        } catch (err) {
            return res.status(400).json({ message: err.message });
        }

        const result = await MasterCategoryService.getListCategory(input, { lang });

        if (!result.status) {
            return res.status(result.code).json({ message: result.message });
        }

        const data = result.data || {};
        const rows = data.rows || [];

        return res.status(200).json({
            data: rows.map(CategoryTransformer.item),
            meta: {
                page: input.page,
                limit: input.limit,
                total_data: data.count,
                total_page: Math.ceil(data.count / input.limit)
            }
        });
    } catch (err) {
        LogUtils.loggingError({
            function_name: 'getListCategory',
            message: err.message
        });

        return res.status(500).json({ message: lang.INTERNAL_SERVER_ERROR });
    }
};

module.exports = exports;
