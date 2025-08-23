const ResourcesRepository = require('../../../repositories/mysql/resources');

exports.deleteResource = async (req, res) => {
    try {
        const id = req.params.id;
        if (!id) {
            return res.status(400).json({ message: 'Resource id is required' });
        }
        const resource = await ResourcesRepository.findOne({ id });
        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }
        await ResourcesRepository.delete({ id });
        return res.status(200).json({ message: 'Resource deleted successfully' });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = exports;
