const ExamService = require('../../../services/v1/exam');
const ActiveExamTransformer = require('../../../transformers/v1/exam/active_exam');
const Language = require('../../../languages');
const LogUtils = require('../../../utils/logger');

let lang;

exports.getActiveExam = async (req, res) => {
    try {
        lang = Language.getLanguage(req.locale);

        const input = { user: req.session };

        const result = await ExamService.getActiveExam(input, { lang });

        if (!result.status) {
            return res.status(result.code).json({ message: result.message });
        }

        return res.status(200).json({
            data: ActiveExamTransformer.item(result.data)
        });
    } catch (err) {
        LogUtils.logError({
            function_name: 'getActiveExam',
            message: err.message
        });

        return res.status(500).json({ message: lang.INTERNAL_SERVER_ERROR });
    }
};

module.exports = exports;
