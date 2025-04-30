const ExamRepository = require('../../../repositories/mysql/exam');

exports.deleteExam = async (req, res) => {
    try {
        const id = req.params.id;
        if (!id) {
            return res.status(400).json({ message: 'Exam id is required' });
        }
        const exam = await ExamRepository.findOne({ id });
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }
        await ExamRepository.delete({ id });
        return res.status(200).json({ message: 'Exam deleted successfully' });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = exports;
