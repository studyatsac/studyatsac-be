const UserExamRepository = require('../../../repositories/mysql/user_exam');

exports.deleteUserExam = async (req, res) => {
    try {
        const id = req.params.id;
        if (!id) {
            return res.status(400).json({ message: 'UserExam id is required' });
        }
        const userExam = await UserExamRepository.findOne({ id });
        if (!userExam) {
            return res.status(404).json({ message: 'UserExam not found' });
        }
        await UserExamRepository.delete({ id });
        return res.status(200).json({ message: 'UserExam deleted successfully' });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = exports;
