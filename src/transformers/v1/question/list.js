exports.item = (data) => {
    if (!data) {
        return null;
    }

    const userAnswer = data.UserAnswer;

    const responseData = {
        uuid: data.uuid,
        questionNumber: data.questionNumber,
        question: data.question,
        answerOption: data.answerOption.options,
        userAnswer: userAnswer?.answer || null
    };

    if (data.isFinishedExam) {
        responseData.explanation = data.explanation;
        responseData.correctAnswer = data.correctAnswer;
        responseData.isCorrect = userAnswer?.isCorrect || false;
    }

    return responseData;
};

module.exports = exports;
