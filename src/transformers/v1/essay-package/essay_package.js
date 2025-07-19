const EssayPackageMappingTransformer = require('./essay_package_mapping');
const ProductPackageTransformer = require('../product-package/product_package');
const ProductPackageConstants = require('../../../constants/product_package');

exports.essayPackageItem = (data, isRestricted = true) => {
    if (!data || data.type !== ProductPackageConstants.TYPE.ESSAY) return null;

    return {
        ...(ProductPackageTransformer.productPackageItem(data, isRestricted) || {}),
        essayPackageMappings: data.productPackageMappings
            && EssayPackageMappingTransformer.essayPackageMappingList(data.productPackageMappings, isRestricted)
    };
};

exports.essayPackageList = (data, isRestricted = true) => {
    if (!data || !Array.isArray(data)) return null;

    return data.map((item) => exports.essayPackageItem(item, isRestricted)).filter(Boolean);
};

module.exports = exports;
