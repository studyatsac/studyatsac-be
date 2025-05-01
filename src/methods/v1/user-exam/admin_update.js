const UserExamRepository = require('../../../repositories/mysql/user_exam');

exports.updateUserExam = async (req, res) => {
    try {
        const id = req.params.id;
        const updateData = req.body;
        if (!id) {
            return res.status(400).json({ message: 'UserExam id is required' });
        }
        const userExam = await UserExamRepository.findOne({ id });
        if (!userExam) {
            return res.status(404).json({ message: 'UserExam not found' });
        }
        await UserExamRepository.update({ id }, updateData);
        const updatedUserExam = await UserExamRepository.findOne({ id });
        return res.status(200).json({ data: updatedUserExam });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = exports;
