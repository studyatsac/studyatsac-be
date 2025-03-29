const ExamPackageTransformer = require('./list');

exports.item = (data) => {
    const examPackage = data.ExamPackage;

    const responseData = {
        uuid: data.uuid,
        examPackage: ExamPackageTransformer.item(examPackage)
    };

    return responseData;
};

module.exports = exports;
