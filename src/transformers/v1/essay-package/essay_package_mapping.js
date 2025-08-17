const EssayTransformer = require('../essay/essay');
const ProductPackageMappingTransformer = require('../product-package/product_package_mapping');

exports.essayPackageMappingItem = (data, isRestricted = true) => {
    if (!data) return null;

    return {
        ...(ProductPackageMappingTransformer.productPackageMappingItem(data) || {}),
        essay: data.essay && EssayTransformer.essayItem(data.essay, isRestricted)
    };
};

exports.essayPackageMappingList = (data, isRestricted = true) => {
    if (!data || !Array.isArray(data)) return null;

    return data.map((item) => exports.essayPackageMappingItem(item, isRestricted)).filter(Boolean);
};

module.exports = exports;
