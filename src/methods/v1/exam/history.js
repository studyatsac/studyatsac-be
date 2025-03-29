const HistoryValidation = require('../../../validations/v1/exam/history');
const ExamService = require('../../../services/v1/exam');
const ExamHistoryTransformer = require('../../../transformers/v1/exam/finish_exam');
const Language = require('../../../languages');
const LogUtils = require('../../../utils/logger');

let lang;

exports.getExamHistory = async (req, res) => {
    try {
        const { params } = req;

        lang = Language.getLanguage(req.locale);

        let input;

        try {
            input = await HistoryValidation(lang).validateAsync(params);
        } catch (err) {
            return res.status(400).json({ message: err.message });
        }

        input.user = req.session;

        const result = await ExamService.examHistory(input, { lang });

        if (!result.status) {
            return res.status(result.code).json({ message: result.message });
        }

        const data = result.data || {};
        const rows = data.rows || [];

        return res.status(200).json({
            data: rows.map(ExamHistoryTransformer.item),
            meta: {
                page: input.page,
                limit: input.limit,
                totalData: data.count,
                totalPage: Math.ceil(data.count / input.limit)
            }
        });
    } catch (err) {
        LogUtils.loggingError({
            functionName: 'getExamHistory',
            message: err.message
        });

        return res.status(500).json({ message: lang.INTERNAL_SERVER_ERROR });
    }
};

module.exports = exports;
