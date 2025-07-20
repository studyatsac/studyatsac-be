const Response = require('../../utils/response');
const Models = require('../../models/mysql');
const InterviewRepository = require('../../repositories/mysql/interview');
const ProductPackageConstants = require('../../constants/product_package');
const ProductPackageService = require('./product_package');

const getInterviewPackage = async (input, opts = {}) => {
    const language = opts.lang;

    return ProductPackageService.getProductPackage(
        { ...input, type: ProductPackageConstants.TYPE.INTERVIEW },
        {
            ...opts,
            productPackageMappingInclude: { include: { model: Models.Interview, as: 'interview' } },
            notFoundMessage: language.INTERVIEW_PACKAGE.NOT_FOUND
        }
    );
};

const getPaidInterviewPackage = async (input, opts = {}) => {
    const language = opts.lang;

    return ProductPackageService.getPaidProductPackage(
        { ...input, type: ProductPackageConstants.TYPE.INTERVIEW },
        { ...opts, notFoundMessage: language.INTERVIEW_PACKAGE.NOT_FOUND }
    );
};

const getAllInterviewPackage = async (input, opts = {}) => {
    const language = opts.lang;

    return ProductPackageService.getAllProductPackage(
        { ...input, type: ProductPackageConstants.TYPE.INTERVIEW },
        { ...opts, notFoundMessage: language.INTERVIEW_PACKAGE.NOT_FOUND }
    );
};

const getAllInterviewPackageAndCount = async (input, opts = {}) => {
    const language = opts.lang;

    return ProductPackageService.getAllProductPackageAndCount(
        { ...input, type: ProductPackageConstants.TYPE.INTERVIEW },
        { ...opts, notFoundMessage: language.INTERVIEW_PACKAGE.NOT_FOUND }
    );
};

const getAllMyInterviewPackageAndCount = async (input, opts = {}) => {
    const language = opts.lang;

    return ProductPackageService.getAllMyProductPackageAndCount(
        { ...input, type: ProductPackageConstants.TYPE.INTERVIEW },
        { ...opts, notFoundMessage: language.INTERVIEW_PACKAGE.NOT_FOUND }
    );
};

const createInterviewPackage = async (input, opts = {}) => {
    const language = opts.lang;

    let inputProductPackageMappings = [];
    let totalMaxAttempt = 0;
    let defaultItemMaxAttempt = 0;
    if (input.interviewPackageMappings && Array.isArray(input.interviewPackageMappings)) {
        inputProductPackageMappings = input.interviewPackageMappings;

        const interviewUuids = inputProductPackageMappings.map((item) => item.interviewUuid);
        const interviews = await InterviewRepository.findAll(
            { uuid: { [Models.Op.in]: interviewUuids } },
            { attributes: ['id', 'uuid'] }
        );

        for (let index = 0; index < inputProductPackageMappings.length; index++) {
            const interview = interviews.find((item) => item.uuid === inputProductPackageMappings[index].interviewUuid);
            if (!interview) {
                return Response.formatServiceReturn(false, 404, null, language.INTERVIEW.NOT_FOUND);
            }
            inputProductPackageMappings[index] = { ...inputProductPackageMappings[index], interviewId: interview.id };

            totalMaxAttempt += inputProductPackageMappings[index].maxAttempt;
            defaultItemMaxAttempt = inputProductPackageMappings[index].maxAttempt;
        }
    }

    if (input.totalMaxAttempt != null) totalMaxAttempt = input.totalMaxAttempt;
    if (input.defaultItemMaxAttempt != null) defaultItemMaxAttempt = input.defaultItemMaxAttempt;

    return ProductPackageService.createProductPackage(
        {
            ...input,
            type: ProductPackageConstants.TYPE.INTERVIEW,
            totalMaxAttempt,
            defaultItemMaxAttempt,
            productPackageMappings: inputProductPackageMappings
        },
        {
            ...opts,
            createFailedMessage: language.INTERVIEW_PACKAGE.CREATE_FAILED,
            createNappingFailedMessage: language.INTERVIEW_PACKAGE_MAPPING.CREATE_FAILED
        }
    );
};

const updateInterviewPackage = async (input, opts = {}) => {
    const language = opts.lang;

    let inputProductPackageMappings = [];
    let totalMaxAttempt = 0;
    let defaultItemMaxAttempt = 0;
    if (input.interviewPackageMappings && Array.isArray(input.interviewPackageMappings)) {
        inputProductPackageMappings = input.interviewPackageMappings;

        const interviewUuids = inputProductPackageMappings.map((item) => item.interviewUuid);
        const interviews = await InterviewRepository.findAll(
            { uuid: { [Models.Op.in]: interviewUuids } },
            { attributes: ['id', 'uuid'] }
        );

        for (let index = 0; index < inputProductPackageMappings.length; index++) {
            // eslint-disable-next-line no-loop-func
            const interview = interviews.find((item) => item.uuid === inputProductPackageMappings[index].interviewUuid);
            if (!interview) {
                return Response.formatServiceReturn(false, 404, null, language.INTERVIEW.NOT_FOUND);
            }
            inputProductPackageMappings[index] = { ...inputProductPackageMappings[index], interviewId: interview.id };

            totalMaxAttempt += inputProductPackageMappings[index].maxAttempt;
            defaultItemMaxAttempt = inputProductPackageMappings[index].maxAttempt;
        }
    }

    if (input.totalMaxAttempt != null) totalMaxAttempt = input.totalMaxAttempt;
    if (input.defaultItemMaxAttempt != null) defaultItemMaxAttempt = input.defaultItemMaxAttempt;

    return ProductPackageService.updateProductPackage(
        {
            ...input,
            type: ProductPackageConstants.TYPE.INTERVIEW,
            totalMaxAttempt,
            defaultItemMaxAttempt,
            productPackageMappings: inputProductPackageMappings
        },
        {
            ...opts,
            notFoundMessage: language.INTERVIEW_PACKAGE.NOT_FOUND,
            updateFailedMessage: language.INTERVIEW_PACKAGE.UPDATE_FAILED,
            deleteMappingFailedMessage: language.INTERVIEW_PACKAGE_MAPPING.DELETE_FAILED,
            updateMappingFailedMessage: language.INTERVIEW_PACKAGE_MAPPING.UPDATE_FAILED
        }
    );
};

const deleteInterviewPackage = async (input, opts = {}) => {
    const language = opts.lang;

    return ProductPackageService.deleteProductPackage(
        { ...input, type: ProductPackageConstants.TYPE.INTERVIEW },
        {
            ...opts,
            notFoundMessage: language.INTERVIEW_PACKAGE.NOT_FOUND,
            deleteSuccessMessage: language.INTERVIEW_PACKAGE.DELETE_SUCCESS
        }
    );
};

exports.getInterviewPackage = getInterviewPackage;
exports.getPaidInterviewPackage = getPaidInterviewPackage;
exports.getAllInterviewPackage = getAllInterviewPackage;
exports.getAllInterviewPackageAndCount = getAllInterviewPackageAndCount;
exports.getAllMyInterviewPackageAndCount = getAllMyInterviewPackageAndCount;
exports.createInterviewPackage = createInterviewPackage;
exports.updateInterviewPackage = updateInterviewPackage;
exports.deleteInterviewPackage = deleteInterviewPackage;

module.exports = exports;
