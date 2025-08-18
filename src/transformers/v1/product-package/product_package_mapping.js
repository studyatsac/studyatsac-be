exports.productPackageMappingItem = (data) => {
    if (!data) return null;

    return {
        uuid: data.uuid,
        maxAttempt: data.maxAttempt,
        currentAttempt: data.currentAttempt == null ? 0 : data.currentAttempt
    };
};

exports.productPackageMappingList = (data) => {
    if (!data || !Array.isArray(data)) return null;

    return data.map(exports.productPackageMappingItem).filter(Boolean);
};

module.exports = exports;
