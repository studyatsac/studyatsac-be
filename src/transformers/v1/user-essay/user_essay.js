const EssayTransformer = require('../essay/essay');
const EssayItemTransformer = require('../essay/essay_item');

exports.userEssayItem = (data) => {
    if (!data) return null;

    return {
        uuid: data.uuid,
        user: data.user && {
            fullName: data.user.fullName,
            email: data.user.email,
            institutionName: data.user.institutionName,
            faculty: data.user.faculty
        },
        essay: data.essay && {
            ...EssayTransformer.essayItem(data.essay),
            essayItems: EssayItemTransformer.essayItemList(data.essay.essayItems)
        },
        overallReview: data.overallReview,
        createdAt: data.created_at,
        essayItemCount: data.essayItemCount ?? data?.dataValues?.essayItemCount
    };
};

exports.userEssayList = (data) => {
    if (!data || !Array.isArray(data)) return null;

    return data.map(exports.userEssayItem);
};

module.exports = exports;
