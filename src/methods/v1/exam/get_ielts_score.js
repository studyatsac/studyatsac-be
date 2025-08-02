const GetIeltsValidation = require('../../../validations/v1/exam/get_ielts_score');
const ExamService = require('../../../services/v1/exam');
const IeltsScoreTransformer = require('../../../transformers/v1/exam/ielts_score_list');
const Language = require('../../../languages');
const LogUtils = require('../../../utils/logger');

let lang;

exports.getIeltsScore = async (req, res) => {
    try {
        const { params, query } = req;

        lang = Language.getLanguage(req.locale);

        let input;

        try {
            input = await GetIeltsValidation(lang).validateAsync({ ...params, ...query });
        } catch (err) {
            return res.status(400).json({ message: err.message });
        }

        input.user = req.session;

        const result = await ExamService.getIeltsScores(input, { lang });

        if (!result.status) {
            return res.status(result.code).json({ message: result.message });
        }

        const data = result.data || {};
        const rows = data.rows || [];

        return res.status(200).json({
            data: rows.map(IeltsScoreTransformer.item),
            meta: {
                page: input.page,
                limit: input.limit,
                total_data: data.count,
                total_page: Math.ceil(data.count / input.limit)
            }
        });
    } catch (err) {
        LogUtils.logError({
            function_name: 'getIeltsScore',
            message: err.message
        });

        return res.status(500).json({ message: lang.INTERNAL_SERVER_ERROR });
    }
};

module.exports = exports;
