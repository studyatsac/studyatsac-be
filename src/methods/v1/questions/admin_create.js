const QuestionServices = require('../../../services/v1/questions');
const QuestionTransformer = require('../../../transformers/v1/question/question');
const QuestionValidation = require('../../../validations/v1/question/create');
const Language = require('../../../languages');
const LogUtils = require('../../../utils/logger');

let lang;

exports.createQuestions = async (req, res) => {
    try {
        lang = Language.getLanguage(req.locale);

        let input;
        try {
            input = await QuestionValidation(lang).validateAsync(req.body);
        } catch (err) {
            return res.status(400).json({ message: err.message });
        }

        input.answerOption = QuestionTransformer.transformAnswerOptions(input.body.answerOptionA, input.body.answerOptionB, input.body.answerOptionC, input.body.answerOptionD);

        const result = await QuestionServices.createQuestion(input, { lang });

        if (!result.status) {
            return res.status(result.code).json({ message: result.message });
        }

        return res.status(200).json({ data: result.data, message: lang.QUESTION.CREATE_SUCCESS });
    } catch (err) {
        LogUtils.logError({
            functionName: 'createQuestion',
            message: err.message
        });

        return res.status(500).json({ message: lang.INTERNAL_SERVER_ERROR });
    }
};

module.exports = exports;
