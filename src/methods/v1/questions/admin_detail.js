const QuestionRepository = require('../../../repositories/mysql/question');

exports.getQuestionDetail = async (req, res) => {
    try {
        const id = req.params.id;
        if (!id) {
            return res.status(400).json({ message: 'Question id is required' });
        }
        const question = await QuestionRepository.findOne({ id });
        if (!question) {
            return res.status(404).json({ message: 'Question not found' });
        }
        return res.status(200).json({ data: question });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = exports;
