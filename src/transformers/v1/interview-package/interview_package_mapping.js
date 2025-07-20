const InterviewTransformer = require('../interview/interview');
const ProductPackageMappingTransformer = require('../product-package/product_package_mapping');

exports.interviewPackageMappingItem = (data, isRestricted = true) => {
    if (!data) return null;

    return {
        ...(ProductPackageMappingTransformer.productPackageMappingItem(data) || {}),
        interview: data.interview && InterviewTransformer.interviewItem(data.interview, isRestricted)
    };
};

exports.interviewPackageMappingList = (data, isRestricted = true) => {
    if (!data || !Array.isArray(data)) return null;

    return data.map((item) => exports.interviewPackageMappingItem(item, isRestricted)).filter(Boolean);
};

module.exports = exports;
