const ListValidation = require('../../../validations/v1/exam-package/list');
const ExamPackageService = require('../../../services/v1/exam_package');
const ExamPackageTransformer = require('../../../transformers/v1/exam-package/list');
const Language = require('../../../languages');
const LogUtils = require('../../../utils/logger');

let lang;

exports.getListExamPackage = async (req, res) => {
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

        const result = await ExamPackageService.getListExamPackage(input, { lang });

        if (!result.status) {
            return res.status(result.code).json({ message: result.message });
        }

        const data = result.data || {};
        const rows = data.rows || [];

        return res.status(200).json({
            data: rows.map(ExamPackageTransformer.item),
            meta: {
                page: input.page,
                limit: input.limit,
                total_data: data.count,
                total_page: Math.ceil(data.count / input.limit)
            }
        });
    } catch (err) {
        LogUtils.logError({
            function_name: 'getListExamPackage',
            message: err.message
        });

        return res.status(500).json({ message: lang.INTERNAL_SERVER_ERROR });
    }
};

module.exports = exports;
