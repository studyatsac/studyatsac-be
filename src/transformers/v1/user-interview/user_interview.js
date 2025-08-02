const InterviewTransformer = require('../interview/interview');
const UserInterviewSectionTransformer = require('./user_interview_section');

exports.userInterviewItem = (data, isRestricted = true) => {
    if (!data) return null;

    return {
        uuid: data.uuid,
        user: data.user && {
            fullName: data.user.fullName,
            email: data.user.email,
            institutionName: data.user.institutionName,
            faculty: data.user.faculty
        },
        interview: data.interview && InterviewTransformer.interviewItem(data.interview, isRestricted),
        status: data.status,
        startedAt: data.startedAt,
        pausedAt: data.pausedAt,
        completedAt: data.completedAt,
        overallReview: data.overallReview,
        overallReviewStatus: data.overallReviewStatus,
        language: data.language,
        backgroundDescription: data.backgroundDescription,
        interviewSectionCount: data.interviewSectionCount ?? data.dataValues?.interviewSectionCount,
        interviewSections: UserInterviewSectionTransformer.userInterviewSectionList(data.interviewSections, isRestricted),
        sessionId: data.sessionId || undefined,
        createdAt: data.created_at
    };
};

exports.userInterviewList = (data, isRestricted = true) => {
    if (!data || !Array.isArray(data)) return null;

    return data.map((item) => exports.userInterviewItem(item, isRestricted)).filter(Boolean);
};

module.exports = exports;
