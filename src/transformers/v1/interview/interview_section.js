const InterviewItemTransformer = require('./interview_section_question');

exports.interviewSectionItem = (data, isRestricted = true) => {
    if (!data) return null;

    return {
        uuid: data.uuid,
        number: data.number,
        title: data.title,
        description: data.description,
        duration: data.duration,
        ...(!isRestricted ? { systemPrompt: data.systemPrompt } : {}),
        interviewSectionQuestions: InterviewItemTransformer.interviewSectionQuestionList(data?.interviewSectionQuestions, isRestricted)
    };
};

exports.interviewSectionList = (data, isRestricted = true) => {
    if (!data || !Array.isArray(data)) return null;

    return data.map((item) => exports.interviewSectionItem(item, isRestricted)).filter(Boolean);
};

module.exports = exports;
