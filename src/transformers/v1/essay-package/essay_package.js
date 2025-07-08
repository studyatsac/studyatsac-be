const EssayPackageMappingTransformer = require('./essay_package_mapping');

exports.essayPackageItem = (data, isRestricted = true) => {
    if (!data) return null;

    return {
        uuid: data.uuid,
        title: data.title,
        description: data.description,
        additionalInformation: data.additionalInformation,
        price: data.price,
        totalMaxAttempt: data.totalMaxAttempt,
        defaultItemMaxAttempt: data.defaultItemMaxAttempt,
        essayPackageMappings: data.essayPackageMappings
            && EssayPackageMappingTransformer.essayPackageMappingList(data.essayPackageMappings, isRestricted),
        isActive: data.isActive
    };
};

exports.essayPackageList = (data, isRestricted = true) => {
    if (!data || !Array.isArray(data)) return null;

    return data.map((item) => exports.essayPackageItem(item, isRestricted));
};

module.exports = exports;
