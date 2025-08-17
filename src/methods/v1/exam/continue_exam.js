const DetailUserExamValidation = require('../../../validations/v1/user-exam/detail');
const ExamService = require('../../../services/v1/exam');
const ExamQuestionTransformer = require('../../../transformers/v1/exam/exam_question');
const Language = require('../../../languages');
const LogUtils = require('../../../utils/logger');

let lang;

exports.getUserExamQuestions = async (req, res) => {
    try {
        const { params } = req;

        lang = Language.getLanguage(req.locale);

        let input;

        try {
            input = await DetailUserExamValidation(lang).validateAsync(params);
        } catch (err) {
            return res.status(400).json({ message: err.message });
        }

        input.user = req.session;

        const result = await ExamService.getUserExamWithQuestionAndAnswer(input, { lang });

        if (!result.status) {
            return res.status(result.code).json({ message: result.message });
        }

        return res.status(200).json({
            data: ExamQuestionTransformer.item(result.data)
        });
    } catch (err) {
        LogUtils.logError({
            functionName: 'getUserExamQuestions',
            message: err.message
        });

        return res.status(500).json({ message: lang.INTERNAL_SERVER_ERROR });
    }
};

module.exports = exports;
