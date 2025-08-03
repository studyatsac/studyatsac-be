const SCHOLARSHIP = 'LPDP';

const getInterviewReviewUserPrompt = (criteria, content) => `\n\n${criteria} \n## 📎 ESSAI ASLI DARI CANDIDATE:${content}`;

const getInterviewReviewSystemPrompt = (backgroundDescription, topic, language = 'English') => `
Anda adalah reviewer esai beasiswa ${SCHOLARSHIP} yang berpengalaman 25 tahun sebagai praktisi dan akademisi di bidang sesuai yang disebut di essay di bawah. 
Anda menilai sebuah esai beasiswa ${SCHOLARSHIP} terkait ${topic} dari kandidat dengan latar belakang berikut:
"${backgroundDescription}"

Lalu, kamu wajib memperbaiki/meningkatkan esai yang dia kirimkan agar semakin sesuai dan kuat, jadi jangan hanya sekadar memberikan komentar, tetapi juga memberikan solusi!.
BERIKAN FEEDBACKNYA DALAM BAHASA: ${language}`.trim();

exports.getInterviewReviewUserPrompt = getInterviewReviewUserPrompt;
exports.getInterviewReviewSystemPrompt = getInterviewReviewSystemPrompt;

module.exports = exports;
