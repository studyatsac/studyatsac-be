const InterviewSectionTransformer = require('../interview/interview_section');
const UserInterviewSectionAnswerTransformer = require('./user_interview_section_answer');

exports.userInterviewSectionItem = (data, isRestricted = true) => {
    if (!data) return null;

    return {
        uuid: data.uuid,
        interviewSection: data.interviewSection && InterviewSectionTransformer.interviewSectionItem(data.interviewSection, isRestricted),
        status: data.status,
        startedAt: data.startedAt,
        pausedAt: data.pausedAt,
        completedAt: data.completedAt,
        duration: data.duration,
        review: data.review,
        reviewStatus: data.reviewStatus,
        language: data.language,
        interviewSectionAnswerCount: data.interviewSectionAnswerCount ?? data.dataValues?.interviewSectionAnswerCount,
        interviewSectionAnswers: UserInterviewSectionAnswerTransformer.userInterviewSectionAnswerList(data.interviewSectionAnswers, isRestricted)
    };
};

exports.userInterviewSectionList = (data, isRestricted = true) => {
    if (!data || !Array.isArray(data)) return null;

    return data.map((item) => exports.userInterviewSectionItem(item, isRestricted)).filter(Boolean);
};

module.exports = exports;
