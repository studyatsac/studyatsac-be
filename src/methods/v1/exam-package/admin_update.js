const ExamPackageRepository = require('../../../repositories/mysql/exam_package');

exports.updateExamPackage = async (req, res) => {
    try {
        const id = req.params.id;
        const updateData = req.body;
        if (!id) {
            return res.status(400).json({ message: 'Exam package id is required' });
        }
        const examPackage = await ExamPackageRepository.findOne({ id });
        if (!examPackage) {
            return res.status(404).json({ message: 'Exam package not found' });
        }
        await ExamPackageRepository.update({ id }, updateData);
        // Ambil data terbaru setelah update
        const updatedExamPackage = await ExamPackageRepository.findOne({ id });
        return res.status(200).json({ data: updatedExamPackage });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = exports;
