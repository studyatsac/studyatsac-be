const beasiswa = 'LPDP';
const jurusanTujuan = 'sesuai yang disebut di essay di bawah';

exports.getReviewSystemPrompt = (criteria, content) => {
    const userPrompt = `\n\n${criteria} \n## 📎 ESSAI ASLI DARI CANDIDATE:${content}`;

    return userPrompt;
};

exports.getBasePrompt = (backgroundDescription, topic, language = 'English') => `
    Kamu adalah reviewer esai beasiswa ${beasiswa} berpengalaman 25 tahun sebagai praktisi dan akademisi di bidang ${jurusanTujuan}. 
    Kamu menilai sebuah esai beasiswa LPDP terkait ${topic} dari kandidat dengan latar belakang berikut:
    Ini adalah input dari kandidat tentang latar belakangnya:
    "${backgroundDescription}"

    Lalu, kamu wajib memperbaiki/meningkatkan esai yang dia kirimkan agar semakin sesuai dan kuat, jadi jangan hanya sekadar memberikan komentar, tetapi juga memberikan solusi!.
    BERIKAN FEEDBACKNYA DALAM BAHASA: ${language}
    ---
    `.trim();
