const ExamPackageRepository = require('../../../repositories/mysql/exam_package');

exports.createExamPackage = async (req, res) => {
    try {
        const data = req.body;
        // Validasi minimal field wajib
        if (!data.title || !data.description || data.price === undefined || data.price === null) {
            return res.status(400).json({ message: 'title, description, and price are required' });
        }
        const created = await ExamPackageRepository.create(data);
        return res.status(201).json({ data: created });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = exports;
