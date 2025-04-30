const ExamRepository = require('../../../repositories/mysql/exam');

exports.createExam = async (req, res) => {
    try {
        const createData = req.body;
        // Validasi sederhana
        if (!createData.title) {
            return res.status(400).json({ message: 'Title is required' });
        }
        const exam = await ExamRepository.create(createData);
        return res.status(201).json({ data: exam });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = exports;
