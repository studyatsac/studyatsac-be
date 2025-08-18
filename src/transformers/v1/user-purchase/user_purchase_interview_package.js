const InterviewPackageTransformer = require('../interview-package/interview_package');
const UserPurchaseTransformer = require('./user_purchase');

exports.userPurchaseInterviewPackageItem = (data, isRestricted = true) => {
    if (!data) return null;

    const productPackage = data.productPackage || data.ProductPackage;

    return {
        ...UserPurchaseTransformer.userPurchaseItem(data, isRestricted),
        interviewPackage: productPackage && InterviewPackageTransformer.interviewPackageItem(productPackage, isRestricted)
    };
};

exports.userPurchaseInterviewPackageList = (data, isRestricted = true) => {
    if (!data || !Array.isArray(data)) return null;

    return data.map((item) => exports.userPurchaseInterviewPackageItem(item, isRestricted)).filter(Boolean);
};

module.exports = exports;
