const UserExamRepository = require('../../../repositories/mysql/user_exam');

exports.createUserExam = async (req, res) => {
    try {
        const createData = req.body;
        if (!createData.userId || !createData.examId) {
            return res.status(400).json({ message: 'userId and examId are required' });
        }
        const userExam = await UserExamRepository.create(createData);
        return res.status(201).json({ data: userExam });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = exports;
