const GetIeltsValidation = require('../../../validations/v1/exam/get_ielts_score');
const ExamService = require('../../../services/v1/exam');
const IeltsWritingSubmissionTransformer = require('../../../transformers/v1/exam/ielts_writing_submission_list');
const Language = require('../../../languages');
const LogUtils = require('../../../utils/logger');

let lang;

exports.getIeltsWritingSubmission = async (req, res) => {
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

        const result = await ExamService.getIeltsWritingSubmissions(input, { lang });

        if (!result.status) {
            return res.status(result.code).json({ message: result.message });
        }

        const data = result.data || {};
        const rows = data.rows || [];

        return res.status(200).json({
            data: rows.map(IeltsWritingSubmissionTransformer.item),
            meta: {
                page: input.page,
                limit: input.limit,
                totalData: data.count,
                totalPage: Math.ceil(data.count / input.limit)
            }
        });
    } catch (err) {
        LogUtils.loggingError({
            functionName: 'getIeltsWritingSubmission',
            message: err.message
        });

        return res.status(500).json({ message: lang.INTERNAL_SERVER_ERROR });
    }
};

module.exports = exports;
