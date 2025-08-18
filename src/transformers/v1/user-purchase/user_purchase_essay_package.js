const EssayPackageTransformer = require('../essay-package/essay_package');
const UserPurchaseTransformer = require('./user_purchase');

exports.userPurchaseEssayPackageItem = (data, isRestricted = true) => {
    if (!data) return null;

    const productPackage = data.productPackage || data.ProductPackage;

    return {
        ...UserPurchaseTransformer.userPurchaseItem(data, isRestricted),
        essayPackage: productPackage && EssayPackageTransformer.essayPackageItem(productPackage, isRestricted)
    };
};

exports.userPurchaseEssayPackageList = (data, isRestricted = true) => {
    if (!data || !Array.isArray(data)) return null;

    return data.map((item) => exports.userPurchaseEssayPackageItem(item, isRestricted)).filter(Boolean);
};

module.exports = exports;
