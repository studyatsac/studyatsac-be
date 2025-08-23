const SectionRepository = require('../../../repositories/mysql/section');

exports.updateSection = async (req, res) => {
    try {
        const id = req.params.id;
        const updateData = req.body;
        if (!id) {
            return res.status(400).json({ message: 'Section id is required' });
        }
        const section = await SectionRepository.findOne({ id });
        if (!section) {
            return res.status(404).json({ message: 'Section not found' });
        }
        await SectionRepository.update({ id }, updateData);
        const updatedSection = await SectionRepository.findOne({ id });
        return res.status(200).json({ data: updatedSection });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = exports;
