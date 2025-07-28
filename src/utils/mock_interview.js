const Uuid = require('uuid');
const Cache = require('../clients/cache/main');
const MockInterviewConstants = require('../constants/mock_interview');
const CommonConstants = require('../constants/common');

const MOCK_INTERVIEW_PREFIX_KEY = 'mock_interview';
const MOCK_INTERVIEW_SESSION_KEY = `${MOCK_INTERVIEW_PREFIX_KEY}_session`;
const MOCK_INTERVIEW_SID_KEY = `${MOCK_INTERVIEW_PREFIX_KEY}_sid`;
const MOCK_INTERVIEW_PAUSE_PREFIX_KEY = `${MOCK_INTERVIEW_PREFIX_KEY}_pause`;
const MOCK_INTERVIEW_RESPOND_PREFIX_KEY = `${MOCK_INTERVIEW_PREFIX_KEY}_respond`;
const MOCK_INTERVIEW_SPEECH_TEXTS_PREFIX_KEY = `${MOCK_INTERVIEW_PREFIX_KEY}_speech_texts`;
const MOCK_INTERVIEW_SPEECH_COUNTER_PREFIX_KEY = `${MOCK_INTERVIEW_PREFIX_KEY}_speech_counter`;

const SCHOLARSHIP = 'LPDP';

const setMockInterviewSessionId = async (userId, userInterviewUuid, sessionId) => {
    const key = `${MOCK_INTERVIEW_SESSION_KEY}-${userId}-${userInterviewUuid}`;
    await Cache.setCache(key, sessionId, MockInterviewConstants.MAX_SESSION_TIME_IN_MILLISECONDS + (60 * 1000));
};

const generateMockInterviewSessionId = async (userId, userInterviewUuid) => {
    const sessionId = Uuid.v4();
    await setMockInterviewSessionId(userId, userInterviewUuid, sessionId);

    return sessionId;
};

const getMockInterviewSessionId = async (userId, userInterviewUuid) => {
    const key = `${MOCK_INTERVIEW_SESSION_KEY}-${userId}-${userInterviewUuid}`;
    return Cache.getCache(key);
};

const deleteMockInterviewSessionId = async (userId, userInterviewUuid) => {
    const key = `${MOCK_INTERVIEW_SESSION_KEY}-${userId}-${userInterviewUuid}`;
    await Cache.deleteCache(key);
};

const isMockInterviewRunning = async (userId, userInterviewUuid) => !!(await getMockInterviewSessionId(userId, userInterviewUuid));

const getMockInterviewSid = async (userId, userInterviewUuid) => {
    const key = `${MOCK_INTERVIEW_SID_KEY}-${userId}-${userInterviewUuid}`;
    return Cache.getCache(key);
};

const setMockInterviewSid = async (userId, userInterviewUuid, sid) => {
    const key = `${MOCK_INTERVIEW_SID_KEY}-${userId}-${userInterviewUuid}`;
    await Cache.setCache(key, sid, MockInterviewConstants.MAX_SESSION_TIME_IN_MILLISECONDS + (5 * 60 * 1000));
};

const deleteMockInterviewSid = async (userId, userInterviewUuid) => {
    const key = `${MOCK_INTERVIEW_SID_KEY}-${userId}-${userInterviewUuid}`;
    await Cache.deleteCache(key);
};

const setMockInterviewPauseJobId = async (userId, userInterviewUuid, jobId) => {
    const key = `${MOCK_INTERVIEW_PAUSE_PREFIX_KEY}-${userId}-${userInterviewUuid}`;
    await Cache.setCache(key, jobId, MockInterviewConstants.MAX_IDLE_TIME_IN_MILLISECONDS + (5 * 60 * 1000));
};

const getMockInterviewPauseJobId = async (userId, userInterviewUuid) => {
    const key = `${MOCK_INTERVIEW_PAUSE_PREFIX_KEY}-${userId}-${userInterviewUuid}`;
    return Cache.getCache(key);
};

const deleteMockInterviewPauseJobId = async (userId, userInterviewUuid) => {
    const key = `${MOCK_INTERVIEW_PAUSE_PREFIX_KEY}-${userId}-${userInterviewUuid}`;
    await Cache.deleteCache(key);
};

const setMockInterviewRespondJobId = async (userId, userInterviewUuid, jobId) => {
    const key = `${MOCK_INTERVIEW_RESPOND_PREFIX_KEY}-${userId}-${userInterviewUuid}`;
    await Cache.setCache(key, jobId, MockInterviewConstants.RESPOND_TIME_IN_MILLISECONDS + (3 * 60 * 1000));
};

const getMockInterviewRespondJobId = async (userId, userInterviewUuid) => {
    const key = `${MOCK_INTERVIEW_RESPOND_PREFIX_KEY}-${userId}-${userInterviewUuid}`;
    return Cache.getCache(key);
};

const deleteMockInterviewRespondJobId = async (userId, userInterviewUuid) => {
    const key = `${MOCK_INTERVIEW_RESPOND_PREFIX_KEY}-${userId}-${userInterviewUuid}`;
    await Cache.deleteCache(key);
};

const getMockInterviewSpeechTexts = async (userId, userInterviewUuid) => {
    const key = `${MOCK_INTERVIEW_SPEECH_TEXTS_PREFIX_KEY}-${userId}-${userInterviewUuid}`;
    const data = await Cache.getCache(key);
    if (!data) return [];

    const texts = JSON.parse(data);
    if (!Array.isArray(texts)) return [];

    return texts;
};

const hasMockInterviewSpeechTexts = async (userId, userInterviewUuid, texts) => {
    const targetTexts = texts || await getMockInterviewSpeechTexts(userId, userInterviewUuid);
    return !!targetTexts && Array.isArray(targetTexts) && targetTexts.length > 0;
};

const updateMockInterviewSpeechTexts = async (userId, userInterviewUuid, texts, previousTexts) => {
    let currentTexts = previousTexts || await getMockInterviewSpeechTexts(userId, userInterviewUuid);
    if (!currentTexts) currentTexts = [];

    currentTexts.push(...texts);
    currentTexts.sort((text, textB) => text.startTime - textB.startTime);

    const key = `${MOCK_INTERVIEW_SPEECH_TEXTS_PREFIX_KEY}-${userId}-${userInterviewUuid}`;
    await Cache.setCache(key, JSON.stringify(currentTexts), 60 * 1000);

    return currentTexts;
};

const deleteMokInterviewSpeechTexts = async (userId, userInterviewUuid) => {
    const key = `${MOCK_INTERVIEW_SPEECH_TEXTS_PREFIX_KEY}-${userId}-${userInterviewUuid}`;
    await Cache.deleteCache(key);
};

const getMockInterviewSpeechCounter = async (userId, userInterviewUuid) => {
    const key = `${MOCK_INTERVIEW_SPEECH_COUNTER_PREFIX_KEY}-${userId}-${userInterviewUuid}`;
    return Number(await Cache.getCache(key)) || 0;
};

const incrementMockInterviewSpeechCounter = async (userId, userInterviewUuid) => {
    const current = await getMockInterviewSpeechCounter(userId, userInterviewUuid);

    const key = `${MOCK_INTERVIEW_SPEECH_COUNTER_PREFIX_KEY}-${userId}-${userInterviewUuid}`;
    const next = current + 1;
    await Cache.setCache(key, next, 60 * 1000);

    return next;
};

const decrementMockInterviewSpeechCounter = async (userId, userInterviewUuid) => {
    const current = await getMockInterviewSpeechCounter(userId, userInterviewUuid);

    const key = `${MOCK_INTERVIEW_SPEECH_COUNTER_PREFIX_KEY}-${userId}-${userInterviewUuid}`;
    const next = Math.max(current - 1, 0);
    await Cache.setCache(key, next, 60 * 1000);

    return next;
};

const getMockInterviewBaseSystemPrompt = (backgroundDescription, topic, language = 'English') => `Anda adalah pewawancara seleksi beasiswa ${SCHOLARSHIP} yang berpengalaman 25 tahun sebagai praktisi dan akademisi di bidang sesuai latar belakang kandidat (jika ada). 
Sesi wawancara beasiswa ${SCHOLARSHIP} kali ini terkait ${topic} dari kandidat ${backgroundDescription ? `dengan latar belakang berikut:
${backgroundDescription}` : `beasiswa ${SCHOLARSHIP}`}

Sebagai pewawancara, perhatikan kriteria berikut:
- Wawancara menggunakan bahasa: ${CommonConstants.LANGUAGE_LABELS[language]}.
- Jangan sertakan penjelasan atau instruksi tambahan di luar tanggapan.
- Tanggapan ataupun pertanyaan disampaikan dengan formal dan netral.`;

const getMockInterviewBaseRespondSystemPrompt = (question) => `Kandidat telah diberikan pertanyaan tentang: ${question ? `"${question}"` : 'pertanyaan yang dikaitkan dengan topik'}. Kemudian, anda akan menerima jawaban kandidat dalam bentuk transkrip.
Harap perhatikan bahwa transkrip dapat mengandung kesalahan penulisan atau kalimat yang tidak jelas karena keterbatasan akurasi model Speech-to-Text. Fokuskan analisis pada makna dan niat sebenarnya di balik jawaban, serta keterkaitannya dengan pertanyaan yang diajukan.`;

const getMockInterviewOpeningSystemPrompt = (backgroundDescription, topic, questions, language) => {
    const questionList = questions.map(
        (question, index) => `${(typeof question === 'object' && question?.id) || index + 1}. "${(typeof question === 'object' && question?.question) || question}"`
    ).join('\n');

    const prompt = `${getMockInterviewBaseSystemPrompt(backgroundDescription, topic, language)}

Dari topik tersebut berikan:
- Kalimat pembuka sesi wawancara, seperti:
"Selamat datang pada sesi interview beasiswa ${SCHOLARSHIP}, sebelumnya saya ucapkan selamat telah sampai pada tahap ini."
- Pertanyaan pembuka yang paling menarik, pertimbangkan jika ada relevansi dengan latar belakang kandidat (jika ada), dari daftar berikut:
${questionList}`;
    const hint = 'kalimat pembuka sesi wawancara + pertanyaan pembuka';

    return { prompt, hint };
};

const getMockInterviewContinuingSystemPrompt = (backgroundDescription, topic, previousQuestion, followUpQuestions, language) => {
    const followUps = followUpQuestions?.map(
        (question, index) => `${(typeof question === 'object' && question?.id) || index + 1}. "${(typeof question === 'object' && question?.question) || question}"`
    ).join('\n') ?? '';

    const prompt = `${getMockInterviewBaseSystemPrompt(backgroundDescription, topic, language)}

${getMockInterviewBaseRespondSystemPrompt(previousQuestion)}

Dari jawaban yang diberikan kandidat nantinya, berikan respon berupa:
- Kalimat pembuka untuk sesi wawancara yang sempat terjeda, seperti:
"Selamat datang kembali pada sesi interview beasiswa ${SCHOLARSHIP}, mari kita lanjutkan sesi wawancara ini."
- Tanggapan singkat (1-2 kalimat) mengenai jawaban kandidat, pertimbangkan jika ada relevansi dengan latar belakang kandidat (jika ada). Penting: **hindari menilai jawaban kandidat**.  
- Satu pertanyaan lanjutan yang paling relevan dengan jawaban kandidat dari daftar berikut:
${followUps}`;
    const hint = 'kalimat pembuka untuk melanjutkan sesi + tanggapan jawaban singkat + pertanyaan lanjutan';

    return { prompt, hint };
};

const getMockInterviewRespondSystemPrompt = (backgroundDescription, topic, currentQuestion, followUpQuestions, language) => {
    const followUps = followUpQuestions?.map(
        (question, index) => `${(typeof question === 'object' && question?.id) || index + 1}. "${(typeof question === 'object' && question?.question) || question}"`
    ).join('\n') ?? '';

    const prompt = `${getMockInterviewBaseSystemPrompt(backgroundDescription, topic, language)}

${getMockInterviewBaseRespondSystemPrompt(currentQuestion)}

Dari jawaban yang diberikan kandidat nantinya, berikan respon berupa:
- Tanggapan singkat (1-2 kalimat) mengenai jawaban kandidat, pertimbangkan jika ada relevansi dengan latar belakang kandidat (jika ada). Penting: **hindari menilai jawaban kandidat**.  
- Satu pertanyaan lanjutan yang paling relevan dengan jawaban kandidat dari daftar berikut:
${followUps}`;
    const hint = 'tanggapan jawaban + pertanyaan lanjutan';

    return { prompt, hint };
};

const getMockInterviewRespondTransitionSystemPrompt = (backgroundDescription, topic, questions, previousTopic, previousQuestion, language) => {
    const questionList = questions.map(
        (question, index) => `${(typeof question === 'object' && question?.id) || index + 1}. "${(typeof question === 'object' && question?.question) || question}"`
    ).join('\n');

    const prompt = `${getMockInterviewBaseSystemPrompt(backgroundDescription, topic, language)}

Sesi ini merupakan lanjutan dari sesi sebelumnya terkait ${previousTopic}, berikut pertanyaan dari sesi sebelumnya:
${getMockInterviewBaseRespondSystemPrompt(previousQuestion)}

Untuk berpindah topik sesi, berikan respon berupa:
- Jika jawaban kandidat nantinya memiliki relevansi dengan topik lanjutan ini, maka berikan tanggapan singkat (1-2 kalimat) mengenai jawaban kandidat. Penting: **abaikan jika tidak ada relevansi dan hindari menilai jawaban kandidat ketika menanggapi**.   
- Satu pertanyaan yang paling menarik, pertimbangkan jika ada relevansi dengan latar belakang kandidat (jika ada), dari daftar berikut
${questionList}`;
    const hint = 'tanggapan jawaban (opsional, jika ada relevansi) + pertanyaan pembuka sesi baru';

    return { prompt, hint };
};

const getMockInterviewClosingSystemPrompt = (backgroundDescription, topic, currentQuestion, language) => {
    const prompt = `${getMockInterviewBaseSystemPrompt(backgroundDescription, topic, language)}

${getMockInterviewBaseRespondSystemPrompt(currentQuestion)}

Dari jawaban yang diberikan kandidat nantinya, berikan respon berupa:
- Tanggapan singkat (1-2 kalimat) mengenai jawaban kandidat, pertimbangkan jika ada relevansi dengan latar belakang kandidat (jika ada). Penting: **hindari menilai jawaban kandidat**.  
- Kalimat penutup sesi wawancara, seperti:
"Terimakasih atas jawaban dan diskusi pada sesi interview beasiswa ${SCHOLARSHIP} ini, sepertinya sudah cukup untuk sesi interview ini semoga berhasil."`;
    const hint = 'tanggapan jawaban + kalimat penutup sesi wawancara';

    return { prompt, hint };
};

exports.generateMockInterviewSessionId = generateMockInterviewSessionId;
exports.setMockInterviewSessionId = setMockInterviewSessionId;
exports.getMockInterviewSessionId = getMockInterviewSessionId;
exports.deleteMockInterviewSessionId = deleteMockInterviewSessionId;
exports.isMockInterviewRunning = isMockInterviewRunning;
exports.getMockInterviewSid = getMockInterviewSid;
exports.setMockInterviewSid = setMockInterviewSid;
exports.deleteMockInterviewSid = deleteMockInterviewSid;
exports.setMockInterviewPauseJobId = setMockInterviewPauseJobId;
exports.getMockInterviewPauseJobId = getMockInterviewPauseJobId;
exports.deleteMockInterviewPauseJobId = deleteMockInterviewPauseJobId;
exports.setMockInterviewRespondJobId = setMockInterviewRespondJobId;
exports.getMockInterviewRespondJobId = getMockInterviewRespondJobId;
exports.deleteMockInterviewRespondJobId = deleteMockInterviewRespondJobId;
exports.hasMockInterviewSpeechTexts = hasMockInterviewSpeechTexts;
exports.getMockInterviewSpeechTexts = getMockInterviewSpeechTexts;
exports.updateMockInterviewSpeechTexts = updateMockInterviewSpeechTexts;
exports.deleteMockInterviewSpeechTexts = deleteMokInterviewSpeechTexts;
exports.getMockInterviewSpeechCounter = getMockInterviewSpeechCounter;
exports.incrementMockInterviewSpeechCounter = incrementMockInterviewSpeechCounter;
exports.decrementMockInterviewSpeechCounter = decrementMockInterviewSpeechCounter;
exports.getMockInterviewOpeningSystemPrompt = getMockInterviewOpeningSystemPrompt;
exports.getMockInterviewContinuingSystemPrompt = getMockInterviewContinuingSystemPrompt;
exports.getMockInterviewRespondSystemPrompt = getMockInterviewRespondSystemPrompt;
exports.getMockInterviewRespondTransitionSystemPrompt = getMockInterviewRespondTransitionSystemPrompt;
exports.getMockInterviewClosingSystemPrompt = getMockInterviewClosingSystemPrompt;

module.exports = exports;
