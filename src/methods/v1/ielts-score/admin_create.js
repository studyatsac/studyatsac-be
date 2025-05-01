const IeltsScoreRepository = require('../../../repositories/mysql/ielts_score');

exports.createIeltsScore = async (req, res) => {
    try {
        const createData = req.body;
        // Validasi field sesuai kebutuhan
        const score = await IeltsScoreRepository.create(createData);
        return res.status(201).json({ data: score });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = exports;
