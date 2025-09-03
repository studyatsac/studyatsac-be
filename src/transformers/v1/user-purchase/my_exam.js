exports.item = (data) => {
    const exam = data.exam;

    const responseData = {
        uuid: exam.uuid,
        title: exam.title,
        numberOfQuestion: exam.numberOfQuestion,
        description: exam.description,
        duration: exam.duration,
        gradeRules: exam.gradeRules,
        additionalInformation: exam.additionalInformation
    };

    return responseData;
};

module.exports = exports;
