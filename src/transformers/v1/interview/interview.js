const InterviewSectionTransformer = require('./interview_section');

exports.interviewItem = (data, isRestricted = true) => {
    if (!data) return null;

    return {
        uuid: data.uuid,
        title: data.title,
        description: data.description,
        isActive: data.isActive,
        interviewSections: InterviewSectionTransformer.interviewSectionList(data?.interviewSections, isRestricted)
    };
};

exports.interviewList = (data, isRestricted = true) => {
    if (!data || !Array.isArray(data)) return null;

    return data.map((item) => exports.interviewItem(item, isRestricted)).filter(Boolean);
};

module.exports = exports;
