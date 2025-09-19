const ExamRepository = require('../../../repositories/mysql/exam');

exports.updateExam = async (req, res) => {
    try {
        const id = req.params.id;
        const updateData = req.body;
        if (!id) {
            return res.status(400).json({ message: 'Exam id is required' });
        }
        const exam = await ExamRepository.findOne({ id });
        if (!exam) {
            return res.status(404).json({ message: 'Exam not found' });
        }
        await ExamRepository.update(updateData, { id });
        const updatedExam = await ExamRepository.findOne({ id });
        return res.status(200).json({ data: updatedExam });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = exports;
