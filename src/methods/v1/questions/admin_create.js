const QuestionServices = require('../../../services/v1/questions');
const QuestionTransformer = require('../../../transformers/v1/question/question');
const Language = require('../../../languages');
const LogUtils = require('../../../utils/logger');

let lang;

exports.createQuestions = async (req, res) => {
    try {
        lang = Language.getLanguage(req.locale);

        let input = {};
        input = {
            resource: req.body.resource,
            examId: req.body.examId,
            sectionId: req.body.sectionId,
            question: req.body.question,
            questionNumber: Number(req.body.questionNumber),
            correctAnswer: req.body.correctAnswer,
            answerOption: '',
            explanation: req.body.explanation,
            score: Number(req.body.score),
            user: req.session
        };

        const rawAnswer = {
            answerOptionA: req.body.answerOptionA,
            answerOptionB: req.body.answerOptionB,
            answerOptionC: req.body.answerOptionC,
            answerOptionD: req.body.answerOptionD
        };

        input.answerOption = QuestionTransformer.transformAnswerOptions(rawAnswer);

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
