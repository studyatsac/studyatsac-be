const ListValidation = require('../../../validations/v1/user-purchase/my_exam_list');
const UserPurchaseService = require('../../../services/v1/user_purchase');
const MyExamTransformer = require('../../../transformers/v1/user-purchase/my_exam');
const Language = require('../../../languages');
const LogUtils = require('../../../utils/logger');

let lang;

exports.getMyExam = async (req, res) => {
    try {
        const { query } = req;

        lang = Language.getLanguage(req.locale);

        let input;

        try {
            input = await ListValidation(lang).validateAsync(query);
        } catch (err) {
            return res.status(400).json({ message: err.message });
        }

        input.user = req.session;

        const result = await UserPurchaseService.getMyExam(input, { lang });

        if (!result.status) {
            return res.status(result.code).json({ message: result.message });
        }

        const data = result.data || {};
        const rows = data.rows || [];

        return res.status(200).json({
            data: rows.map(MyExamTransformer.item),
            meta: {
                page: input.page,
                limit: input.limit,
                total_data: data.count,
                total_page: Math.ceil(data.count / input.limit)
            }
        });
    } catch (err) {
        LogUtils.logError({
            function_name: 'getMyExam',
            message: err.message
        });

        return res.status(500).json({ message: lang.INTERNAL_SERVER_ERROR });
    }
};

module.exports = exports;
