const UserExamRepository = require('../../../repositories/mysql/user_exam');

exports.createUserExam = async (req, res) => {
    try {
        const create_data = req.body;
        if (!create_data.user_id || !create_data.exam_id) {
            return res.status(400).json({ message: 'user_id and exam_id are required' });
        }
        const user_exam = await UserExamRepository.create(create_data);
        return res.status(201).json({ data: user_exam });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = exports;
