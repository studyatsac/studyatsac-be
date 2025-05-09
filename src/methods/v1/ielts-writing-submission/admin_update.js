const IeltsWritingSubmissionRepository = require('../../../repositories/mysql/ielts_writing_submission');

exports.updateIeltsWritingSubmission = async (req, res) => {
    try {
        const id = req.params.id;
        const update_data = req.body;
        if (!id) {
            return res.status(400).json({ message: 'IeltsWritingSubmission id is required' });
        }
        const submission = await IeltsWritingSubmissionRepository.findOne({ id });
        if (!submission) {
            return res.status(404).json({ message: 'IeltsWritingSubmission not found' });
        }
        await IeltsWritingSubmissionRepository.update({ id }, update_data);
        const updated_submission = await IeltsWritingSubmissionRepository.findOne({ id });
        return res.status(200).json({ data: updated_submission });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = exports;
