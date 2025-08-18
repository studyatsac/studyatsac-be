const ProductPackageMappingTransformer = require('./product_package_mapping');

exports.productPackageItem = (data, isRestricted = true) => {
    if (!data) return null;

    return {
        uuid: data.uuid,
        type: data.type,
        title: data.title,
        description: data.description,
        additionalInformation: data.additionalInformation,
        price: data.price,
        totalMaxAttempt: data.totalMaxAttempt,
        defaultItemMaxAttempt: data.defaultItemMaxAttempt,
        paymentUrl: data.paymentUrl,
        productPackageMappings: data.productPackageMappings
            && ProductPackageMappingTransformer.productPackageMappingList(data.productPackageMappings),
        isActive: data.isActive,
        ...(!isRestricted && data.product ? {
            externalProductId: data.product.externalProductId,
            externalProductName: data.product.externalProductName,
            externalTicketId: data.product.externalTicketId,
            externalTicketName: data.product.externalTicketName
        } : {})
    };
};

exports.productPackageList = (data, isRestricted = true) => {
    if (!data || !Array.isArray(data)) return null;

    return data.map((item) => exports.productPackageItem(item, isRestricted)).filter(Boolean);
};

module.exports = exports;
