exports.transformAnswerOptions = (input) => {
    const mapping = {
        a: input.answerOptionA || '',
        b: input.answerOptionB || '',
        c: input.answerOptionC || '',
        d: input.answerOptionD || '',
        e: input.answerOptionE || ''
    };

    const options = Object.entries(mapping)
        .filter(([_, text]) => text && text.trim() !== '') // buang yang kosong
        .map(([option, text]) => ({
            option,
            text
        }));

    return { options };
};
