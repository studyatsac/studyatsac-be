const Moment = require('moment');

exports.item = (data) => {
    if (!data) {
        return null;
    }

    const {
        activeExam,
        exam
    } = data;

    const today = Moment.utc();
    const expiredDate = Moment(activeExam.startDate).add(exam.duration, 'minutes');

    const responseData = {
        userExamUuid: activeExam.uuid,
        examUuid: exam.uuid,
        title: exam.title,
        startDate: exam.startDate,
        isExpired: today.isAfter(expiredDate)
    };

    return responseData;
};

module.exports = exports;
