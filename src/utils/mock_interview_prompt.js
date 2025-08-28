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
Sebagai pewawancara, perhatikan kriteria berikut ketika memberikan tanggapan/pertanyaan:
- Wawancara menggunakan bahasa: ${CommonConstants.LANGUAGE_LABELS[language] || CommonConstants.LANGUAGE_LABELS.ENGLISH}.
- Jika pertanyaan bukan bahasa ${CommonConstants.LANGUAGE_LABELS[language] || CommonConstants.LANGUAGE_LABELS.ENGLISH}, terjemahkan pertanyaan ke bahasa ${CommonConstants.LANGUAGE_LABELS[language] || CommonConstants.LANGUAGE_LABELS.ENGLISH}.
- Hindari menggunakan memanggil kandidat dengan kata "${CANDIDATE[language]}", gunakan kata "${YOU[language]}" sebagai kata panggilan.
- Perhatikan bahwa transkrip jawaban dapat mengandung kesalahan penulisan atau kalimat yang tidak jelas. Fokuskan pada makna serta keterkaitannya dengan pertanyaan yang diajukan.
- Setiap respon harus disertai dengan pertanyaan lanjutan, kecuali ketika pembukaan/penutupan sesi wawancara.
- Sebaiknya tidak menyertakan penjelasan atau instruksi tambahan di luar tanggapan.
- Tanggapan ataupun pertanyaan disampaikan dengan formal dan netral.`;

const getMockInterviewSystemPrompt = (backgroundDescription, topic, language = CommonConstants.LANGUAGE.ENGLISH) => `Anda adalah pewawancara seleksi beasiswa${SCHOLARSHIP ? ` ${SCHOLARSHIP}` : ''} yang berpengalaman 25 tahun sebagai praktisi dan akademisi di bidang sesuai latar belakang kandidat (jika ada). 
Sesi wawancara beasiswa${SCHOLARSHIP ? ` ${SCHOLARSHIP}` : ''} kali ini terkait ${topic} dari kandidat ${backgroundDescription ? `dengan latar belakang berikut:
${backgroundDescription}` : `beasiswa${SCHOLARSHIP ? ` ${SCHOLARSHIP}` : ''}`}

${getMockInterviewBaseCriteriaPrompt(language)}`;

const getMockInterviewOpeningUserPrompt = (topic, language) => {
    let opening = `Selamat datang pada sesi interview beasiswa${SCHOLARSHIP ? ` ${SCHOLARSHIP}` : ''}, sebelumnya saya ucapkan selamat telah sampai pada tahap ini.`;
    if (language === CommonConstants.LANGUAGE.ENGLISH) {
        opening = `Welcome to the ${SCHOLARSHIP ? `${SCHOLARSHIP} ` : ''}scholarship interview session. First of all, congratulations on reaching this stage.`;
    }

    const prompt = `${getMockInterviewBaseCriteriaPrompt(language)}

Dari topik ${topic}, berikan:
- Kalimat pembuka sesi wawancara, seperti:
"${opening}"
- Permintaan untuk memperkenalkan diri.`;
    const hint = 'kalimat pembuka sesi wawancara + meminta perkenalan';

    return { prompt, hint };
};

const getMockInterviewContinuingUserPrompt = (previousQuestion, answer, followUpQuestions, language) => {
    const followUps = followUpQuestions?.map(
        (question, index) => `${(typeof question === 'object' && question?.id) || index + 1}. "${(typeof question === 'object' && question?.question) || question}"`
    ).join('\n') ?? '';

    let opening = `Selamat datang kembali pada sesi interview beasiswa${SCHOLARSHIP ? ` ${SCHOLARSHIP}` : ''}, mari kita lanjutkan sesi wawancara ini.`;
    if (language === CommonConstants.LANGUAGE.ENGLISH) {
        opening = `Welcome back to the${SCHOLARSHIP ? ` ${SCHOLARSHIP}` : ''} scholarship interview session. Let's continue with the interview.`;
    }

    const prompt = `Pertanyaan terakhir: ${previousQuestion}

Transkip jawaban kandidat: ${answer}

${getMockInterviewBaseCriteriaPrompt(language)}

Dari jawaban tersebut, berikan respon berupa:
- Kalimat pembuka untuk sesi wawancara yang sempat terjeda, seperti:
"${opening}"
- Tanggapan singkat (1 kalimat) mengenai jawaban kandidat, pertimbangkan jika ada relevansi dengan latar belakang kandidat. Penting: **hindari menilai jawaban kandidat**.  
- Satu pertanyaan lanjutan yang paling relevan dengan jawaban kandidat dari daftar berikut: ${followUps} ATAU jika tidak ada pertanyaan di daftar sebelumnya, berikan pertanyaan baru yang paling relevan dengan topik dan latar belakang kandidat terkait.`;
    const hint = 'kalimat pembuka untuk melanjutkan sesi + tanggapan jawaban singkat + pertanyaan lanjutan';

    return { prompt, hint };
};

const getMockInterviewRespondUserPrompt = (answer, followUpQuestions, language) => {
    const followUps = followUpQuestions?.map(
        (question, index) => `${(typeof question === 'object' && question?.id) || index + 1}. "${(typeof question === 'object' && question?.question) || question}"`
    ).join('\n') ?? '';

    const prompt = `Transkip jawaban kandidat: ${answer}

${getMockInterviewBaseCriteriaPrompt(language)}

Dari jawaban yang diberikan kandidat nantinya, berikan respon berupa:
- Tanggapan singkat (1 kalimat) mengenai jawaban kandidat, pertimbangkan jika ada relevansi dengan latar belakang kandidat (jika ada). Penting: **hindari menilai jawaban kandidat secara kuantitatif**.  
- Satu pertanyaan lanjutan yang paling relevan dengan jawaban kandidat dari daftar berikut: ${followUps} ATAU jika tidak ada pertanyaan di daftar sebelumnya, berikan pertanyaan baru yang paling relevan dengan topik dan latar belakang kandidat terkait.`;
    const hint = 'tanggapan jawaban + pertanyaan lanjutan/baru';

    return { prompt, hint };
};

const getMockInterviewRespondTransitionUserPrompt = (previousTopic, previousQuestion, answer, questions, language) => {
    const questionList = questions.map(
        (question, index) => `${(typeof question === 'object' && question?.id) || index + 1}. "${(typeof question === 'object' && question?.question) || question}"`
    ).join('\n');

    const prompt = `Sesi ini merupakan lanjutan dari sesi sebelumnya terkait topik ${previousTopic}.

Pertanyaan sesi sebelumnya: ${previousQuestion}

Transkirp jawaban kandidat: ${answer}

${getMockInterviewBaseCriteriaPrompt(language)}

Untuk berpindah topik sesi, berikan respon berupa:
- Jika jawaban kandidat nantinya memiliki relevansi dengan topik lanjutan ini, maka berikan tanggapan singkat (1 kalimat) mengenai jawaban kandidat. Penting: **abaikan jika tidak ada relevansi dan hindari menilai jawaban kandidat secara kuantitatif ketika menanggapi**.   
- Satu pertanyaan yang paling menarik, pertimbangkan jika ada relevansi dengan latar belakang kandidat (jika ada), dari daftar berikut ${questionList} ATAU jika tidak ada pertanyaan tersedia dari daftar tersebut, berikan pertanyaan yang paling relevan dengan topik selanjutnya dan latar belakang kandidat.`;
    const hint = 'tanggapan jawaban (opsional, jika ada relevansi) + pertanyaan pembuka sesi baru';

    return { prompt, hint };
};

const getMockInterviewClosingUserPrompt = (answer, language) => {
    let closing = `Terimakasih atas jawaban dan diskusi pada sesi interview beasiswa${SCHOLARSHIP ? ` ${SCHOLARSHIP}` : ''} ini, sepertinya sudah cukup untuk sesi interview ini semoga berhasil.`;
    if (language === CommonConstants.LANGUAGE.ENGLISH) {
        closing = `Thank you for your answers and discussions on the${SCHOLARSHIP ? ` ${SCHOLARSHIP}` : ''} scholarship interview session, it seems that it's enough for the interview session, I hope you have a good time.`;
    }

    const prompt = `Transkirp jawaban kandidat: ${answer}

${getMockInterviewBaseCriteriaPrompt(language)}

Dari jawaban yang diberikan kandidat nantinya, berikan respon berupa:
- Tanggapan singkat (1-2 kalimat) mengenai jawaban kandidat, pertimbangkan jika ada relevansi dengan latar belakang kandidat (jika ada). Penting: **hindari menilai jawaban kandidat secara kuantitatif**.  
- Kalimat penutup sesi wawancara, seperti:
"${closing}"`;
    const hint = 'tanggapan jawaban + kalimat penutup sesi wawancara';

    return { prompt, hint };
};

exports.getMockInterviewSystemPrompt = getMockInterviewSystemPrompt;
exports.getMockInterviewOpeningUserPrompt = getMockInterviewOpeningUserPrompt;
exports.getMockInterviewContinuingUserPrompt = getMockInterviewContinuingUserPrompt;
exports.getMockInterviewRespondUserPrompt = getMockInterviewRespondUserPrompt;
exports.getMockInterviewRespondTransitionUserPrompt = getMockInterviewRespondTransitionUserPrompt;
exports.getMockInterviewClosingUserPrompt = getMockInterviewClosingUserPrompt;

module.exports = exports;
