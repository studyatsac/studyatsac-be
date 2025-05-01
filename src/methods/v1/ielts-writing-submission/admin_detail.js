const IeltsWritingSubmissionRepository = require('../../../repositories/mysql/ielts_writing_submission');

exports.getIeltsWritingSubmissionDetail = async (req, res) => {
    try {
        const id = req.params.id;
        if (!id) {
            return res.status(400).json({ message: 'IeltsWritingSubmission id is required' });
        }
        const submission = await IeltsWritingSubmissionRepository.findOne({ id });
        if (!submission) {
            return res.status(404).json({ message: 'IeltsWritingSubmission not found' });
        }
        return res.status(200).json({ data: submission });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = exports;
