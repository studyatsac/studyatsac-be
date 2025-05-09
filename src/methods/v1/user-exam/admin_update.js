const UserExamRepository = require('../../../repositories/mysql/user_exam');

exports.updateUserExam = async (req, res) => {
    try {
        const id = req.params.id;
        const update_data = req.body;
        if (!id) {
            return res.status(400).json({ message: 'UserExam id is required' });
        }
        const user_exam = await UserExamRepository.findOne({ id });
        if (!user_exam) {
            return res.status(404).json({ message: 'UserExam not found' });
        }
        await UserExamRepository.update({ id }, update_data);
        const updated_user_exam = await UserExamRepository.findOne({ id });
        return res.status(200).json({ data: updated_user_exam });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = exports;
