const ExamPackageRepository = require('../../../repositories/mysql/exam_package');

exports.deleteExamPackage = async (req, res) => {
    try {
        const id = req.params.id;
        if (!id) {
            return res.status(400).json({ message: 'Exam package id is required' });
        }
        const examPackage = await ExamPackageRepository.findOne({ id });
        if (!examPackage) {
            return res.status(404).json({ message: 'Exam package not found' });
        }
        await ExamPackageRepository.delete({ id });
        return res.status(200).json({ message: 'Exam package deleted successfully' });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = exports;
