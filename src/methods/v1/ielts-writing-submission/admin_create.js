const IeltsWritingSubmissionRepository = require('../../../repositories/mysql/ielts_writing_submission');

exports.createIeltsWritingSubmission = async (req, res) => {
    try {
        const create_data = req.body;
        // Validasi field sesuai kebutuhan
        const submission = await IeltsWritingSubmissionRepository.create(create_data);
        return res.status(201).json({ data: submission });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = exports;
