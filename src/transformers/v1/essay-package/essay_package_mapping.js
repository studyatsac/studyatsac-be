const EssayTransformer = require('../essay/essay');

exports.essayPackageMappingItem = (data, isRestricted = true) => {
    if (!data) return null;

    return {
        uuid: data.uuid,
        maxAttempt: data.maxAttempt,
        currentAttempt: data.currentAttempt === null ? 0 : (data.currentAttempt || undefined),
        essay: data.essay && EssayTransformer.essayItem(data.essay, isRestricted)
    };
};

exports.essayPackageMappingList = (data, isRestricted = true) => {
    if (!data || !Array.isArray(data)) return null;

    return data.map((item) => exports.essayPackageMappingItem(item, isRestricted)).filter(Boolean);
};

module.exports = exports;
