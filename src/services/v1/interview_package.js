const Response = require('../../utils/response');
const Models = require('../../models/mysql');
const EssayRepository = require('../../repositories/mysql/essay');
const ProductPackageConstants = require('../../constants/product_package');
const ProductPackageService = require('./product_package');

const getEssayPackage = async (input, opts = {}) => {
    const language = opts.lang;

    return ProductPackageService.getProductPackage(
        { ...input, type: ProductPackageConstants.TYPE.ESSAY },
        {
            ...opts,
            productPackageMappingInclude: { include: { model: Models.Essay, as: 'essay' } },
            notFoundMessage: language.ESSAY_PACKAGE.NOT_FOUND
        }
    );
};

const getPaidEssayPackage = async (input, opts = {}) => {
    const language = opts.lang;

    return ProductPackageService.getPaidProductPackage(
        { ...input, type: ProductPackageConstants.TYPE.ESSAY },
        { ...opts, notFoundMessage: language.ESSAY_PACKAGE.NOT_FOUND }
    );
};

const getAllEssayPackage = async (input, opts = {}) => {
    const language = opts.lang;

    return ProductPackageService.getAllProductPackage(
        { ...input, type: ProductPackageConstants.TYPE.ESSAY },
        { ...opts, notFoundMessage: language.ESSAY_PACKAGE.NOT_FOUND }
    );
};

const getAllEssayPackageAndCount = async (input, opts = {}) => {
    const language = opts.lang;

    return ProductPackageService.getAllProductPackageAndCount(
        { ...input, type: ProductPackageConstants.TYPE.ESSAY },
        { ...opts, notFoundMessage: language.ESSAY_PACKAGE.NOT_FOUND }
    );
};

const getAllMyEssayPackageAndCount = async (input, opts = {}) => {
    const language = opts.lang;

    return ProductPackageService.getAllMyProductPackageAndCount(
        { ...input, type: ProductPackageConstants.TYPE.ESSAY },
        { ...opts, notFoundMessage: language.ESSAY_PACKAGE.NOT_FOUND }
    );
};

const createEssayPackage = async (input, opts = {}) => {
    const language = opts.lang;

    let inputProductPackageMappings = [];
    let totalMaxAttempt = 0;
    let defaultItemMaxAttempt = 0;
    if (input.essayPackageMappings && Array.isArray(input.essayPackageMappings)) {
        inputProductPackageMappings = input.essayPackageMappings;

        const essayUuids = inputProductPackageMappings.map((item) => item.essayUuid);
        const essays = await EssayRepository.findAll(
            { uuid: { [Models.Op.in]: essayUuids } },
            { attributes: ['id', 'uuid'] }
        );

        for (let index = 0; index < inputProductPackageMappings.length; index++) {
            const essay = essays.find((item) => item.uuid === inputProductPackageMappings[index].essayUuid);
            if (!essay) {
                return Response.formatServiceReturn(false, 404, null, language.ESSAY.NOT_FOUND);
            }
            inputProductPackageMappings[index] = { ...inputProductPackageMappings[index], essayId: essay.id };

            totalMaxAttempt += inputProductPackageMappings[index].maxAttempt;
            defaultItemMaxAttempt = inputProductPackageMappings[index].maxAttempt;
        }
    }

    if (input.totalMaxAttempt != null) totalMaxAttempt = input.totalMaxAttempt;
    if (input.defaultItemMaxAttempt != null) defaultItemMaxAttempt = input.defaultItemMaxAttempt;

    return ProductPackageService.createProductPackage(
        {
            ...input,
            type: ProductPackageConstants.TYPE.ESSAY,
            totalMaxAttempt,
            defaultItemMaxAttempt,
            productPackageMappings: inputProductPackageMappings
        },
        {
            ...opts,
            createFailedMessage: language.ESSAY_PACKAGE.CREATE_FAILED,
            createNappingFailedMessage: language.ESSAY_PACKAGE_MAPPING.CREATE_FAILED
        }
    );
};

const updateEssayPackage = async (input, opts = {}) => {
    const language = opts.lang;

    let inputProductPackageMappings = [];
    let totalMaxAttempt = 0;
    let defaultItemMaxAttempt = 0;
    if (input.essayPackageMappings && Array.isArray(input.essayPackageMappings)) {
        inputProductPackageMappings = input.essayPackageMappings;

        const essayUuids = inputProductPackageMappings.map((item) => item.essayUuid);
        const essays = await EssayRepository.findAll(
            { uuid: { [Models.Op.in]: essayUuids } },
            { attributes: ['id', 'uuid'] }
        );

        for (let index = 0; index < inputProductPackageMappings.length; index++) {
            // eslint-disable-next-line no-loop-func
            const essay = essays.find((item) => item.uuid === inputProductPackageMappings[index].essayUuid);
            if (!essay) {
                return Response.formatServiceReturn(false, 404, null, language.ESSAY.NOT_FOUND);
            }
            inputProductPackageMappings[index] = { ...inputProductPackageMappings[index], essayId: essay.id };

            totalMaxAttempt += inputProductPackageMappings[index].maxAttempt;
            defaultItemMaxAttempt = inputProductPackageMappings[index].maxAttempt;
        }
    }

    if (input.totalMaxAttempt != null) totalMaxAttempt = input.totalMaxAttempt;
    if (input.defaultItemMaxAttempt != null) defaultItemMaxAttempt = input.defaultItemMaxAttempt;

    return ProductPackageService.updateProductPackage(
        {
            ...input,
            type: ProductPackageConstants.TYPE.ESSAY,
            totalMaxAttempt,
            defaultItemMaxAttempt,
            productPackageMappings: inputProductPackageMappings
        },
        {
            ...opts,
            notFoundMessage: language.ESSAY_PACKAGE.NOT_FOUND,
            updateFailedMessage: language.ESSAY_PACKAGE.UPDATE_FAILED,
            deleteMappingFailedMessage: language.ESSAY_PACKAGE_MAPPING.DELETE_FAILED,
            updateMappingFailedMessage: language.ESSAY_PACKAGE_MAPPING.UPDATE_FAILED
        }
    );
};

const deleteEssayPackage = async (input, opts = {}) => {
    const language = opts.lang;

    return ProductPackageService.deleteProductPackage(
        { ...input, type: ProductPackageConstants.TYPE.ESSAY },
        {
            ...opts,
            notFoundMessage: language.ESSAY_PACKAGE.NOT_FOUND,
            deleteSuccessMessage: language.ESSAY_PACKAGE.DELETE_SUCCESS
        }
    );
};

exports.getEssayPackage = getEssayPackage;
exports.getPaidEssayPackage = getPaidEssayPackage;
exports.getAllEssayPackage = getAllEssayPackage;
exports.getAllEssayPackageAndCount = getAllEssayPackageAndCount;
exports.getAllMyEssayPackageAndCount = getAllMyEssayPackageAndCount;
exports.createEssayPackage = createEssayPackage;
exports.updateEssayPackage = updateEssayPackage;
exports.deleteEssayPackage = deleteEssayPackage;

module.exports = exports;
