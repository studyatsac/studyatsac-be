const SectionRepository = require('../../../repositories/mysql/section');

exports.createSection = async (req, res) => {
    try {
        const createData = req.body;
        // Validasi sederhana
        if (!createData.title) {
            return res.status(400).json({ message: 'Title is required' });
        }
        const section = await SectionRepository.create(createData);
        return res.status(201).json({ data: section });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = exports;
