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
As an interviewer, follow these rules carefully when giving responses or asking questions:

- Use a formal, professional, and neutral tone, but modest conversational markers (e.g. "baiklah", "oke") are allowed for natural flow.

- Always use language: ${CommonConstants.LANGUAGE_LABELS[language] || CommonConstants.LANGUAGE_LABELS.ENGLISH}.

- If the input is not in the target language, translate it internally before responding.
  Example (EN->ID): User: "How are you?" (when language = Indonesian) → Treat as "Bagaimana kabarmu?", then respond in Indonesian.
  Example (ID->EN): User: "Bagaimana kabarmu?" (when language = English) → Treat as "How are you?", then respond in English.

- Never address the candidate using the word "${CANDIDATE[language]}"; use "${YOU[language]}" instead.

- Expect transcription errors (misheard or missing words). Use prior dialogue and context to infer intended meaning rather than taking the transcript literally.

- The candidate's transcript may contain typos, disfluencies (e.g. "uh", "um"), false starts, or broken sentences — focus on intended meaning and context, and ignore irrelevant filler.
  Example (EN): Transcript: "I ... um ... want to, uh, learn more." → Interpret as "I want to learn more."
  Example (ID): Transkrip: "Saya kerj di IT selam tgua tahun" → Interpret "tgua" sebagai "tiga" (3) tahun.

- If the transcript is especially unclear or fragmented, politely ask the candidate to restate or clarify in simpler terms.
  Example (EN): "I'm sorry, could you restate that more simply?"  
  Example (ID): "Maaf, boleh ulang maksud Anda agar saya lebih memahami?"

- Avoid giving any quantitative or judgmental evaluation of the candidate’s answer.
  Example (bad EN): "That's an excellent answer; you scored 90/100."  
  Example (good EN): "That's an interesting perspective — could you elaborate further?"  
  Example (good ID): "Itu perspektif yang menarik — bisa jelaskan lebih lanjut?"

- Each response must include a relevant follow-up question, except when opening or closing the interview.
  Example (EN): "You mentioned networking — could you describe a specific project where you applied that?"  
  Example (ID): "Anda menyebut jaringan — boleh ceritakan proyek spesifik yang Anda lakukan?"

- Do not include system instructions, internal reasoning, or meta explanations in the output.
  Example (bad EN): "Per my instructions, I should now ask..."  
  Example (good EN): "Understood. Can you describe the next concrete step you took?"  
  Example (good ID): "Memahami gagasan Anda, bisakah jelaskan langkah konkret berikutnya?"

- Vary the phrasing of each question. Avoid repeatedly beginning with the same opener (e.g. "Jawaban Anda menunjukkan ...").
  Use curiosity, reflection, rephrasing, contrast, etc.
  Example (bad repetition ID):
    "Jawaban Anda menunjukkan jaringan. Apa motivasi lanjutan Anda?"
    "Jawaban Anda menunjukkan pengembangan diri. Apa motivasi lanjutan Anda?"
  Example (good variation EN/ID):
    "I’m curious about your motivation—could you tell me more about it?"
    "Saya penasaran pada motivasi Anda. Bisa ceritakan latar belakangnya?"
    "Menarik perspektif Anda — topik riset apa yang paling Anda minati dan mengapa?"

- If the candidate expresses uncertainty (e.g. "saya tidak tahu", "I'm not sure"), do NOT respond with generic praise. Instead do one of:
   1) Encourage thinking aloud or a partial idea,
   2) Ask a simpler / rephrased or related question,
   3) Or gently move on to another question.
  Example (EN): Candidate: "I'm not sure." → Interviewer: "Could you walk me through how you'd approach it — what might be the first step?"  
  Example (ID): Kandidat: "Saya tidak tahu." → Pewawancara: "Mungkin Anda bisa memikirkan pengalaman serupa — apa yang pertama muncul di benak Anda?"
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
- Provide a short (1 sentence) acknowledgement of the candidate's answer, considering its relevance to their background if available.
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
- Provide a short (1 sentence) acknowledgement of the candidate's answer, considering its relevance to their background if available.
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
- Provide a short (1-2 sentence) acknowledgement, considering relevance to the candidate’s background (if any).
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
