const CommonConstants = require('../constants/common');

const SCHOLARSHIP = 'LPDP';

const uniqInputEssayItems = (essayItems) => {
    const essayItemUuids = [];
    const newEssayItems = [];
    essayItems?.forEach((essayItem) => {
        if (essayItemUuids.includes(essayItem.essayItemUuid)) return;

        newEssayItems.push(essayItem);
        essayItemUuids.push(essayItem.essayItemUuid);
    });

    return newEssayItems;
};

const getEssayReviewUserPrompt = (criteria, content) => `KRITERIA: ${criteria}\n\nESSAI ASLI DARI CANDIDATE: ${content}`;

const getEssayReviewSystemPrompt = (backgroundDescription, topic, language = CommonConstants.LANGUAGE.ENGLISH) => `
Anda adalah reviewer esai beasiswa ${SCHOLARSHIP} yang berpengalaman 25 tahun sebagai praktisi dan akademisi di bidang sesuai yang disebut di essay di bawah. 
Anda menilai sebuah esai beasiswa ${SCHOLARSHIP} terkait ${topic} dari kandidat dengan latar belakang berikut:
"${backgroundDescription}"

Lalu, kamu wajib memperbaiki/meningkatkan esai yang dia kirimkan agar semakin sesuai dan kuat, jadi jangan hanya sekadar memberikan komentar, tetapi juga memberikan solusi!.
BERIKAN FEEDBACKNYA DALAM BAHASA: ${CommonConstants.LANGUAGE_LABELS[language] || CommonConstants.LANGUAGE_LABELS.ENGLISH}`.trim();

exports.uniqInputEssayItems = uniqInputEssayItems;
exports.getEssayReviewUserPrompt = getEssayReviewUserPrompt;
exports.getEssayReviewSystemPrompt = getEssayReviewSystemPrompt;

module.exports = exports;
