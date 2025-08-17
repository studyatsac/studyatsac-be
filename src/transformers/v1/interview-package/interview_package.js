const InterviewPackageMappingTransformer = require('./interview_package_mapping');
const ProductPackageTransformer = require('../product-package/product_package');
const ProductPackageConstants = require('../../../constants/product_package');

exports.interviewPackageItem = (data, isRestricted = true) => {
    if (!data || data.type !== ProductPackageConstants.TYPE.INTERVIEW) return null;

    return {
        ...(ProductPackageTransformer.productPackageItem(data, isRestricted) || {}),
        interviewPackageMappings: data.productPackageMappings
            && InterviewPackageMappingTransformer.interviewPackageMappingList(data.productPackageMappings, isRestricted)
    };
};

exports.interviewPackageList = (data, isRestricted = true) => {
    if (!data || !Array.isArray(data)) return null;

    return data.map((item) => exports.interviewPackageItem(item, isRestricted)).filter(Boolean);
};

module.exports = exports;
