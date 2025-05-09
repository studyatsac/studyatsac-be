const IeltsScoreRepository = require('../../../repositories/mysql/ielts_score');

exports.updateIeltsScore = async (req, res) => {
    try {
        const id = req.params.id;
        const update_data = req.body;
        if (!id) {
            return res.status(400).json({ message: 'IeltsScore id is required' });
        }
        const score = await IeltsScoreRepository.findOne({ id });
        if (!score) {
            return res.status(404).json({ message: 'IeltsScore not found' });
        }
        await IeltsScoreRepository.update({ id }, update_data);
        const updated_score = await IeltsScoreRepository.findOne({ id });
        return res.status(200).json({ data: updated_score });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = exports;
