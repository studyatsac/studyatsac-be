const ResourcesRepository = require('../../../repositories/mysql/resources');

exports.updateResource = async (req, res) => {
    try {
        const id = req.params.id;
        if (!id) {
            return res.status(400).json({ message: 'Resource id is required' });
        }
        const resource = await ResourcesRepository.findOne({ id });

        if (!resource) {
            return res.status(404).json({ message: 'Resource not found' });
        }

        const { resourceName, type, sourceLink } = req.body;
        const updateData = { resource_name: resourceName, type, source_link: sourceLink };
        await ResourcesRepository.update(updateData, { id });
        const updatedResource = await ResourcesRepository.findOne({ id });
        return res.status(200).json({ data: updatedResource });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = exports;
