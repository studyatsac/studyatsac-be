const ProductPackageTransformer = require('../product-package/product_package');
const ExamPackageTransformer = require('../exam-package/list');

exports.userPurchaseItem = (data, isRestricted = true) => {
    if (!data) return null;

    const user = data.User || data.user;
    const examPackage = data.ExamPackage || data.examPackage;
    const productPackage = data.productPackage || data.ProductPackage;

    return {
        uuid: data.uuid,
        user: user && {
            fullName: user.fullName,
            email: user.email,
            institutionName: user.institutionName,
            faculty: user.faculty
        },
        examPackage: examPackage && ExamPackageTransformer.item(examPackage),
        productPackage: productPackage && ProductPackageTransformer.productPackageItem(productPackage, isRestricted),
        ...(!isRestricted ? { externalTransactionId: data.externalTransactionId } : {}),
        createdAt: data.created_at
    };
};

exports.userPurchaseList = (data, isRestricted = true) => {
    if (!data || !Array.isArray(data)) return null;

    return data.map((item) => exports.userPurchaseItem(item, isRestricted)).filter(Boolean);
};

module.exports = exports;
