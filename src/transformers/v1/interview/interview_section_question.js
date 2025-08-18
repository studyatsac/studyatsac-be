exports.interviewSectionQuestionItem = (data, isRestricted = true) => {
    if (!data) return null;

    return {
        uuid: data.uuid,
        number: data.number,
        question: data.question,
        hint: data.hint,
        ...(!isRestricted ? { systemPrompt: data.systemPrompt } : {})
    };
};

exports.interviewSectionQuestionList = (data, isRestricted = true) => {
    if (!data || !Array.isArray(data)) return null;

    return data.map((item) => exports.interviewSectionQuestionItem(item, isRestricted)).filter(Boolean);
};

module.exports = exports;
