const QuestionRepository = require('../../../repositories/mysql/question');
const QuestionTransformer = require('../../../transformers/v1/question/question');

exports.updateQuestion = async (req, res) => {
    try {
        const id = req.params.id;
        let updateData = {};

        updateData = {
            resource_id: req.body.resource,
            examId: req.body.examId,
            section_id: req.body.sectionId,
            question: req.body.question,
            questionNumber: Number(req.body.questionNumber),
            correctAnswer: req.body.correctAnswer,
            answerOption: '',
            explanation: req.body.explanation,
            score: Number(req.body.score)
        };

        const rawAnswer = {
            answerOptionA: req.body.answerOptionA,
            answerOptionB: req.body.answerOptionB,
            answerOptionC: req.body.answerOptionC,
            answerOptionD: req.body.answerOptionD
        };

        // Ubah objek menjadi string JSON
        const transformedOptions = QuestionTransformer.transformAnswerOptions(rawAnswer);
        updateData.answerOption = JSON.stringify(transformedOptions);

        if (!id) {
            return res.status(400).json({ message: 'Question id is required' });
        }

        const question = await QuestionRepository.findOne({ id });
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }
        await QuestionRepository.update(updateData, { id });
        return res.status(200).json({ data: updateData });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = exports;
