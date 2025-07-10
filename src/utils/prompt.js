const beasiswa = 'LPDP';
const jurusanTujuan = 'sesuai yang disebut di essay di bawah';

exports.getReviewSystemPrompt = (topic, criteria, language = 'English', content) => {
    const userPrompt = `\n\n${criteria} \n## 📎 ESSAI ASLI DARI CANDIDATE:${content}`;

    return userPrompt;
};

exports.getBasePrompt = (backgroundDescription) => `
    Kamu adalah reviewer beasiswa ${beasiswa} berpengalaman 25 tahun sebagai praktisi dan akademisi di bidang ${jurusanTujuan}. 
    Kamu menilai sebuah esai beasiswa LPDP dari kandidat dengan latar belakang berikut:
    Ini adalah input dari kandidat tentang latar belakangnya:
    "${backgroundDescription}"

    Lalu, kamu wajib memperbaiki/meningkatkan esai yang dia kirimkan agar semakin sesuai dan kuat, jadi jangan hanya sekadar memberikan komentar, tetapi juga memberikan solusi!.
    ---
    `.trim();
