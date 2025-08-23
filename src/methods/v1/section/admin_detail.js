const SectionRepository = require('../../../repositories/mysql/section');

exports.getSectionDetail = async (req, res) => {
    try {
        const id = req.params.id;
        if (!id) {
            return res.status(400).json({ message: 'Section id is required' });
        }
        const section = await SectionRepository.findOne({ id });
        if (!section) {
            return res.status(404).json({ message: 'Section not found' });
        }
        return res.status(200).json({ data: section });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = exports;
