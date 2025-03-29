exports.item = (data) => {
    const responseData = {
        uuid: data.uuid,
        startDate: data.startDate,
        endDate: data.endDate,
        totalQuestion: data.totalQuestion,
        totalCorrectAnswer: data.totalCorrectAnswer,
        totalWrongAnswer: data.totalWrongAnswer,
        totalScore: data.totalScore,
    };

    return responseData;
};

module.exports = exports;
