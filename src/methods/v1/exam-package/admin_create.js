const ExamPackageRepository = require('../../../repositories/mysql/exam_package');

exports.createExamPackage = async (req, res) => {
    try {
        const create_data = req.body;
        // Validasi minimal field wajib
        if (!create_data.title || !create_data.description || create_data.price === undefined || create_data.price === null) {
            return res.status(400).json({ message: 'title, description, and price are required' });
        }
        const created_exam_package = await ExamPackageRepository.create(create_data);
        return res.status(201).json({ data: created_exam_package });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = exports;
