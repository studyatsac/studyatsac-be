const IeltsScoreRepository = require('../../../repositories/mysql/ielts_score');

exports.deleteIeltsScore = async (req, res) => {
    try {
        const id = req.params.id;
        if (!id) {
            return res.status(400).json({ message: 'IeltsScore id is required' });
        }
        const score = await IeltsScoreRepository.findOne({ id });
        if (!score) {
            return res.status(404).json({ message: 'IeltsScore not found' });
        }
        await IeltsScoreRepository.delete({ id });
        return res.status(200).json({ message: 'IeltsScore deleted successfully' });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = exports;
