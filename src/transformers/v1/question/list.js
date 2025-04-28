exports.item = (data) => {
    if (!data) {
        return null;
    }

    const userAnswer = data.UserAnswer;

    const responseData = {
        uuid: data.uuid,
        questionNumber: data.questionNumber,
        question: data.question,
        answerOption: data.answerOption?.options || data.answerOption || [],
        userAnswer: userAnswer?.answer || null,
        resource_id: data.resource_id || null,
        section_id: data.section_id || null,
    };

    if (data.isFinishedExam) {
        responseData.explanation = data.explanation;
        responseData.correctAnswer = data.correctAnswer;
        responseData.isCorrect = userAnswer?.isCorrect || false;
    }

    return responseData;
};

module.exports = exports;
