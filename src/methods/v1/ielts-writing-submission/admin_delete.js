const IeltsWritingSubmissionRepository = require('../../../repositories/mysql/ielts_writing_submission');

exports.deleteIeltsWritingSubmission = async (req, res) => {
    try {
        const id = req.params.id;
        if (!id) {
            return res.status(400).json({ message: 'IeltsWritingSubmission id is required' });
        }
        const submission = await IeltsWritingSubmissionRepository.findOne({ id });
        if (!submission) {
            return res.status(404).json({ message: 'IeltsWritingSubmission not found' });
        }
        await IeltsWritingSubmissionRepository.delete({ id });
        return res.status(200).json({ message: 'IeltsWritingSubmission deleted successfully' });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = exports;
