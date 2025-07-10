const EssayTransformer = require('../essay/essay');
const UserEssayItemTransformer = require('./user_essay_item');

exports.userEssayItem = (data, isRestricted = true) => {
    if (!data) return null;

    return {
        uuid: data.uuid,
        user: data.user && {
            fullName: data.user.fullName,
            email: data.user.email,
            institutionName: data.user.institutionName,
            faculty: data.user.faculty
        },
        essay: data.essay && EssayTransformer.essayItem(data.essay, isRestricted),
        overallReview: data.overallReview,
        itemReviewStatus: data.itemReviewStatus,
        overallReviewStatus: data.overallReviewStatus,
        language: data.language,
        essayItemCount: data.essayItemCount ?? data.dataValues?.essayItemCount,
        essayItems: UserEssayItemTransformer.userEssayItemList(data.essayItems, isRestricted),
        createdAt: data.created_at
    };
};

exports.userEssayList = (data, isRestricted = true) => {
    if (!data || !Array.isArray(data)) return null;

    return data.map((item) => exports.userEssayItem(item, isRestricted)).filter(Boolean);
};

module.exports = exports;
