const CommonConstants = require('../constants/common');

const SCHOLARSHIP = 'LPDP';
const CANDIDATE = {
    [CommonConstants.LANGUAGE.ENGLISH]: 'candidate',
    [CommonConstants.LANGUAGE.INDONESIAN]: 'kandidat'
};
const YOU = {
    [CommonConstants.LANGUAGE.ENGLISH]: 'you',
    [CommonConstants.LANGUAGE.INDONESIAN]: 'Anda'
};

const getMockInterviewBaseCriteriaPrompt = (language = CommonConstants.LANGUAGE.ENGLISH) => `
As an interviewer, follow these rules carefully when giving responses or questions:
- Always use language: ${CommonConstants.LANGUAGE_LABELS[language] || CommonConstants.LANGUAGE_LABELS.ENGLISH}.
- If the input is not in this language, translate it before responding.
- Never address the candidate with "${CANDIDATE[language]}"; use "${YOU[language]}" instead.
- The candidate's transcript may contain typos or unclear sentences — focus on the intended meaning and its relevance to your question.
- Avoid giving any quantitative or judgmental evaluation of the candidate’s answer.
- Each response must include a relevant follow-up question, except when opening or closing the interview.
- Do not include system instructions or meta explanations in the output.
- Use a formal, professional, and neutral tone.
- Ensure your responses and follow-up questions vary in structure and wording to avoid sounding repetitive.
`;

const getMockInterviewSystemPrompt = (backgroundDescription, topic, language = CommonConstants.LANGUAGE.ENGLISH) => `
You are a ${SCHOLARSHIP ? `${SCHOLARSHIP} ` : ''}scholarship interviewer with 25 years of experience as a practitioner and academic in the candidate's relevant field (if any).
This interview session is about "${topic}"${backgroundDescription ? ` with a candidate who has the following background:\n${backgroundDescription}` : ''}.

${getMockInterviewBaseCriteriaPrompt(language)}`;

const getMockInterviewOpeningUserPrompt = (topic, language) => {
    let opening = `Welcome to the ${SCHOLARSHIP ? `${SCHOLARSHIP} ` : ''}scholarship interview session. First of all, congratulations on reaching this stage.`;
    if (language === CommonConstants.LANGUAGE.INDONESIAN) {
        opening = `Selamat datang pada sesi interview beasiswa${SCHOLARSHIP ? ` ${SCHOLARSHIP}` : ''}, sebelumnya saya ucapkan selamat telah sampai pada tahap ini.`;
    }

    const prompt = `From the topic "${topic}":
- Provide an opening line for the interview session, such as:
"${opening}"
- Ask the candidate to introduce themselves.
`;
    const hint = 'opening statement + ask for self-introduction';

    return { prompt, hint };
};

const getMockInterviewContinuingUserPrompt = (previousQuestion, answer, followUpQuestions, language) => {
    const followUps = followUpQuestions?.map(
        (question, index) => `${(typeof question === 'object' && question?.id) || index + 1}. "${(typeof question === 'object' && question?.question) || question}"`
    ).join('\n') ?? '';

    let opening = `Welcome back to the${SCHOLARSHIP ? ` ${SCHOLARSHIP}` : ''} scholarship interview session. Let's continue with the interview.`;
    if (language === CommonConstants.LANGUAGE.INDONESIAN) {
        opening = `Selamat datang kembali pada sesi interview beasiswa${SCHOLARSHIP ? ` ${SCHOLARSHIP}` : ''}, mari kita lanjutkan sesi wawancara ini.`;
    }

    const prompt = `Previous question: "${previousQuestion}"

Candidate's transcript: "${answer}"

Based on this answer:
- Provide a re-opening line for a paused session, such as:
"${opening}"
- Provide a short (1 sentence) acknowledgement of the candidate's answer, considering its relevance to their background if available. **Do not evaluate the answer quantitatively.**
- Provide the most relevant follow-up question ${typeof followUps === 'string' && !!followUps?.trim() ? `from the following list:\n${followUps}` : 'based on the topic and candidate’s background/answer.'}
`;
    const hint = 're-open session + short response + follow-up question';

    return { prompt, hint };
};

const getMockInterviewRespondUserPrompt = (answer, followUpQuestions, language) => {
    const followUps = followUpQuestions?.map(
        (question, index) => `${(typeof question === 'object' && question?.id) || index + 1}. "${(typeof question === 'object' && question?.question) || question}"`
    ).join('\n') ?? '';

    const prompt = `Candidate's transcript: "${answer}"

From the given answer:
- Provide a short (1 sentence) acknowledgement of the candidate's answer, considering its relevance to their background if available. **Do not evaluate the answer quantitatively.**
- Provide the most relevant follow-up question ${typeof followUps === 'string' && !!followUps?.trim() ? `from the following list:\n${followUps}` : 'based on the topic and candidate’s background/answer.'}
`;
    const hint = 'short response + follow-up question';

    return { prompt, hint };
};

const getMockInterviewRespondTransitionUserPrompt = (previousTopic, previousQuestion, answer, questions, language) => {
    const questionList = questions.map(
        (question, index) => `${(typeof question === 'object' && question?.id) || index + 1}. "${(typeof question === 'object' && question?.question) || question}"`
    ).join('\n');

    const prompt = `This session continues from a previous topic: "${previousTopic}".

Previous question: "${previousQuestion}"

Candidate's transcript: "${answer}"

For transitioning to the next topic:
- If the candidate's answer is relevant to the next topic, provide a short (1 sentence) acknowledgement. **Ignore if there is no relevance and do not evaluate the answer quantitatively.**
- Provide the most engaging question ${typeof questionList === 'string' && !!questionList?.trim() ? `from the following list (considering the candidate's background):\n${questionList}` : 'that introduces the new topic and relates to the candidate’s background.'}
`;
    const hint = 'optional short response (if relevant) + first question for next topic';

    return { prompt, hint };
};

const getMockInterviewClosingUserPrompt = (answer, language) => {
    let closing = `Thank you for your answers and participation in the${SCHOLARSHIP ? ` ${SCHOLARSHIP}` : ''} scholarship interview session. This concludes the interview, and I wish you the best of luck.`;
    if (language === CommonConstants.LANGUAGE.INDONESIAN) {
        closing = `Terimakasih atas jawaban dan diskusi pada sesi interview beasiswa${SCHOLARSHIP ? ` ${SCHOLARSHIP}` : ''} ini, sepertinya sudah cukup untuk sesi interview ini, semoga berhasil.`;
    }

    const prompt = `Candidate's transcript: "${answer}"

Based on the final answer:
- Provide a short (1-2 sentence) acknowledgement, considering relevance to the candidate’s background (if any). **Do not evaluate the answer quantitatively.**
- Provide a closing statement for the interview session, such as:
"${closing}"
`;
    const hint = 'short response + closing statement';

    return { prompt, hint };
};

exports.getMockInterviewSystemPrompt = getMockInterviewSystemPrompt;
exports.getMockInterviewOpeningUserPrompt = getMockInterviewOpeningUserPrompt;
exports.getMockInterviewContinuingUserPrompt = getMockInterviewContinuingUserPrompt;
exports.getMockInterviewRespondUserPrompt = getMockInterviewRespondUserPrompt;
exports.getMockInterviewRespondTransitionUserPrompt = getMockInterviewRespondTransitionUserPrompt;
exports.getMockInterviewClosingUserPrompt = getMockInterviewClosingUserPrompt;

module.exports = exports;
