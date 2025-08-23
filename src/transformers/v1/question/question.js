exports.transformAnswerOptions = (input) => {
    const mapping = {
        a: input.answerOptionA || '',
        b: input.answerOptionB || '',
        c: input.answerOptionC || '',
        d: input.answerOptionD || ''
    };

    const options = Object.entries(mapping)
        .filter(([_, text]) => text && text.trim() !== '') // buang yang kosong
        .map(([option, text]) => ({
            text,
            option
        }));

    return { options };
};
