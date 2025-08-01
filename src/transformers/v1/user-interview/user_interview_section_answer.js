const InterviewSectionQuestionTransformer = require('../interview/interview_section_question');

exports.userInterviewSectionAnswerItem = (data, isRestricted = true) => {
    if (!data) return null;

    return {
        uuid: data.uuid,
        interviewSectionQuestion: data.interviewSectionQuestion && InterviewSectionQuestionTransformer.interviewSectionQuestionItem(data.interviewSectionQuestion, isRestricted),
        status: data.status,
        askedAt: data.askedAt,
        answeredAt: data.answeredAt,
        questionNumber: data.questionNumber,
        question: data.question,
        answer: data.answer,
        review: data.review,
        reviewStatus: data.reviewStatus
    };
};

exports.userInterviewSectionAnswerList = (data, isRestricted = true) => {
    if (!data || !Array.isArray(data)) return null;

    return data.map((item) => exports.userInterviewSectionAnswerItem(item, isRestricted)).filter(Boolean);
};

module.exports = exports;
