const QuestionTransformer = require('../question/list');

exports.item = (data) => {
    if (!data) {
        return null;
    }

    const {
        userExam,
        exam,
        questions,
        isFinishedExam = false
    } = data;

    const responseData = {
        uuid: userExam.uuid,
        startDate: userExam.startDate,
        duration: exam.duration,
        questions: questions.map((q) => {
            q.isFinishedExam = isFinishedExam;
            return QuestionTransformer.item(q);
        })
    };

    return responseData;
};

module.exports = exports;
