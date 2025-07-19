const ProductPackageRepository = require('../../repositories/mysql/product_package');
const ProductPackageMappingRepository = require('../../repositories/mysql/product_package_mapping');
const ProductRepository = require('../../repositories/mysql/product');
const Response = require('../../utils/response');
const Models = require('../../models/mysql');
const Helpers = require('../../utils/helpers');
const EssayRepository = require('../../repositories/mysql/essay');

class EssayPackageError extends Error {}

const getEssayPackage = async (input, opts = {}) => {
    const language = opts.lang;

    const essay = await ProductPackageRepository.findOne(
        input,
        {
            include: [
                {
                    model: Models.ProductPackageMapping,
                    as: 'essayPackageMappings',
                    include: { model: Models.Essay, as: 'essay' }
                },
                {
                    model: Models.Product,
                    as: 'product'
                }
            ]
        }
    );
    if (!essay) {
        return Response.formatServiceReturn(false, 404, null, language.ESSAY_PACKAGE.NOT_FOUND);
    }

    return Response.formatServiceReturn(true, 200, essay, null);
};

const getPaidEssayPackage = async (input, opts = {}) => {
    const language = opts.lang;

    const essay = await ProductPackageRepository.findOneWithMappingFromUserPurchase(input);
    if (!essay) {
        return Response.formatServiceReturn(false, 404, null, language.ESSAY_PACKAGE.NOT_FOUND);
    }

    let essayPackage = essay;
    if (Array.isArray(essay)) {
        essayPackage = essay[0];
        essayPackage.essayPackageMappings = essay.map((item) => item.essayPackageMappings);
    }

    return Response.formatServiceReturn(true, 200, essayPackage, null);
};

const getAllEssayPackage = async (input, opts = {}) => {
    const language = opts.lang;

    const allEssayPackage = await ProductPackageRepository.findAll(input);

    if (!allEssayPackage) {
        return Response.formatServiceReturn(false, 404, null, language.ESSAY_PACKAGE.NOT_FOUND);
    }

    return Response.formatServiceReturn(true, 200, allEssayPackage, null);
};

const getAllEssayPackageAndCount = async (input, opts = {}) => {
    const language = opts.lang;
    const params = opts.params;

    const allEssayPackage = await ProductPackageRepository.findAndCountAll({
        ...input,
        ...(params.search ? {
            [Models.Op.or]: [
                {
                    title: {
                        [Models.Op.like]: `%${params.search}%`
                    }
                },
                {
                    description: {
                        [Models.Op.like]: `%${params.search}%`
                    }
                }
            ]
        } : {})
    }, {
        order: [['created_at', 'desc']],
        limit: params.limit,
        offset: Helpers.setOffset(params.page, params.limit)
    });

    if (!allEssayPackage) {
        return Response.formatServiceReturn(false, 404, null, language.USER_ESSAY.NOT_FOUND);
    }

    return Response.formatServiceReturn(true, 200, allEssayPackage, null);
};

const getAllMyEssayPackageAndCount = async (input, opts = {}) => {
    const language = opts.lang;
    const params = opts.params;

    const userPurchased = await ProductPackageRepository.findAndCountAllFromUserPurchase(
        input,
        {
            limit: params.limit,
            offset: Helpers.setOffset(params.page, params.limit)
        }
    );

    if (!userPurchased) {
        return Response.formatServiceReturn(false, 404, null, language.ESSAY_PACKAGE.NOT_FOUND);
    }

    return Response.formatServiceReturn(true, 200, userPurchased, null);
};

const createEssayPackage = async (input, opts = {}) => {
    const language = opts.lang;

    let inputEssayPackageMappings = [];
    let totalMaxAttempt = 0;
    let defaultItemMaxAttempt = 0;
    if (input.essayPackageMappings && Array.isArray(input.essayPackageMappings)) {
        inputEssayPackageMappings = input.essayPackageMappings;

        const essayUuids = inputEssayPackageMappings.map((item) => item.essayUuid);
        const essays = await EssayRepository.findAll(
            { uuid: { [Models.Op.in]: essayUuids } },
            { attributes: ['id', 'uuid'] }
        );

        for (let index = 0; index < inputEssayPackageMappings.length; index++) {
            const essay = essays.find((item) => item.uuid === inputEssayPackageMappings[index].essayUuid);
            if (!essay) {
                return Response.formatServiceReturn(false, 404, null, language.ESSAY.NOT_FOUND);
            }
            inputEssayPackageMappings[index] = { ...inputEssayPackageMappings[index], essayId: essay.id };

            totalMaxAttempt += inputEssayPackageMappings[index].maxAttempt;
            defaultItemMaxAttempt = inputEssayPackageMappings[index].maxAttempt;
        }
    }

    if (input.totalMaxAttempt != null) totalMaxAttempt = input.totalMaxAttempt;
    if (input.defaultItemMaxAttempt != null) defaultItemMaxAttempt = input.defaultItemMaxAttempt;

    try {
        const result = await Models.sequelize.transaction(async (trx) => {
            const essayPackage = await ProductPackageRepository.create({
                title: input.title,
                description: input.description,
                additionalInformation: input.additionalInformation,
                price: input.price,
                totalMaxAttempt,
                defaultItemMaxAttempt,
                paymentUrl: input.paymentUrl,
                isActive: input.isActive
            }, trx);
            if (!essayPackage) throw new EssayPackageError(language.ESSAY_PACKAGE.CREATE_FAILED);

            const hasProduct = input.externalProductId
                || input.externalProductName
                || input.externalTicketId
                || input.externalTicketName;
            if (hasProduct) {
                const product = await ProductRepository.create({
                    productPackageId: essayPackage.id,
                    externalProductId: input.externalProductId,
                    externalProductName: input.externalProductName,
                    externalTicketId: input.externalTicketId,
                    externalTicketName: input.externalTicketName
                }, trx);
                if (!product) throw new EssayPackageError(language.PRODUCT.CREATE_FAILED);

                essayPackage.product = product;
            }

            if (inputEssayPackageMappings.length) {
                const essayPackageMappings = await ProductPackageMappingRepository.createMany(inputEssayPackageMappings.map((item) => ({
                    essayPackageId: essayPackage.id,
                    essayId: item.essayId,
                    maxAttempt: item.maxAttempt
                })), trx);
                if (!essayPackageMappings) throw new EssayPackageError(language.ESSAY_PACKAGE_MAPPING.CREATE_FAILED);

                essayPackage.essayPackageMappings = essayPackageMappings;
            }

            return essayPackage;
        });

        return Response.formatServiceReturn(true, 200, result, null);
    } catch (err) {
        if (err instanceof EssayPackageError) {
            return Response.formatServiceReturn(false, 500, null, err.message);
        }

        throw err;
    }
};

const updateEssayPackage = async (input, opts = {}) => {
    const language = opts.lang;

    const essayPackage = await ProductPackageRepository.findOne(
        { uuid: input.uuid },
        { include: { model: Models.ProductPackageMapping, attributes: ['id', 'uuid'], as: 'essayPackageMappings' } }
    );

    if (!essayPackage) {
        return Response.formatServiceReturn(false, 404, null, language.ESSAY_PACKAGE.NOT_FOUND);
    }

    let inputEssayPackageMappings = [];
    let totalMaxAttempt = 0;
    let defaultItemMaxAttempt = 0;
    const hasEssayPackageMappings = input.essayPackageMappings && Array.isArray(input.essayPackageMappings);
    if (hasEssayPackageMappings) {
        inputEssayPackageMappings = input.essayPackageMappings;

        const essayUuids = inputEssayPackageMappings.map((item) => item.essayUuid);
        const essays = await EssayRepository.findAll(
            { uuid: { [Models.Op.in]: essayUuids } },
            { attributes: ['id', 'uuid'] }
        );

        for (let index = 0; index < inputEssayPackageMappings.length; index++) {
            // eslint-disable-next-line no-loop-func
            const essay = essays.find((item) => item.uuid === inputEssayPackageMappings[index].essayUuid);
            if (!essay) {
                return Response.formatServiceReturn(false, 404, null, language.ESSAY.NOT_FOUND);
            }
            inputEssayPackageMappings[index] = { ...inputEssayPackageMappings[index], essayId: essay.id };

            totalMaxAttempt += inputEssayPackageMappings[index].maxAttempt;
            defaultItemMaxAttempt = inputEssayPackageMappings[index].maxAttempt;
        }
    }

    if (input.totalMaxAttempt != null) totalMaxAttempt = input.totalMaxAttempt;
    if (input.defaultItemMaxAttempt != null) defaultItemMaxAttempt = input.defaultItemMaxAttempt;

    const hasProduct = input.externalProductId
        || input.externalProductName
        || input.externalTicketId
        || input.externalTicketName;
    let productId;
    if (hasProduct) {
        const product = await ProductRepository.findOne({ productPackageId: essayPackage.id });
        if (product) productId = product.id;
    }

    try {
        const result = await Models.sequelize.transaction(async (trx) => {
            const updatedItem = await ProductPackageRepository.update(
                {
                    title: input.title,
                    description: input.description,
                    additionalInformation: input.additionalInformation,
                    price: input.price,
                    totalMaxAttempt,
                    defaultItemMaxAttempt,
                    paymentUrl: input.paymentUrl,
                    isActive: input.isActive
                },
                { id: essayPackage.id },
                trx
            );
            if ((Array.isArray(updatedItem) && !updatedItem[0]) || !updatedItem) {
                throw new EssayPackageError(language.ESSAY_PACKAGE.UPDATE_FAILED);
            }

            if (hasProduct) {
                const product = await ProductRepository.createOrUpdate({
                    id: productId,
                    productPackageId: essayPackage.id,
                    externalProductId: input.externalProductId,
                    externalProductName: input.externalProductName,
                    externalTicketId: input.externalTicketId,
                    externalTicketName: input.externalTicketName
                }, trx);
                if ((Array.isArray(product) && !product[0]) || !product) {
                    throw new EssayPackageError(language.PRODUCT.UPDATE_FAILED);
                }

                essayPackage.product = product;
            }

            if (hasEssayPackageMappings) {
                if (essayPackage.essayPackageMappings && Array.isArray(essayPackage.essayPackageMappings)) {
                    const deletedEssayPackageMappings = essayPackage.essayPackageMappings.filter(
                        (item) => !inputEssayPackageMappings.find((i) => i.uuid === item.uuid)
                    );
                    if (deletedEssayPackageMappings.length) {
                        const deleteCount = await ProductPackageMappingRepository.delete(
                            { id: deletedEssayPackageMappings.map((item) => item.id) },
                            { force: true },
                            trx
                        );
                        // eslint-disable-next-line max-depth
                        if (!deleteCount) throw new EssayPackageError(language.ESSAY_PACKAGE_MAPPING.DELETE_FAILED);
                    }

                    inputEssayPackageMappings = inputEssayPackageMappings.map((item) => {
                        const essayItem = essayPackage.essayPackageMappings.find((i) => i.uuid === item.uuid);
                        return ({
                            ...item,
                            ...(essayItem && { id: essayItem.id })
                        });
                    });
                }

                const updatingEssayPackageMappings = inputEssayPackageMappings.map(async (item) => {
                    const updatedEssayPackageMapping = await ProductPackageMappingRepository.createOrUpdate({
                        id: item.id,
                        essayPackageId: essayPackage.id,
                        essayId: item.essayId,
                        maxAttempt: item.maxAttempt
                    }, trx);
                    if ((Array.isArray(updatedEssayPackageMapping) && !updatedEssayPackageMapping[0]) || !updatedEssayPackageMapping) {
                        throw new EssayPackageError(language.ESSAY_PACKAGE_MAPPING.UPDATE_FAILED);
                    }
                });

                await Promise.all(updatingEssayPackageMappings);

                essayPackage.essayPackageMappings = inputEssayPackageMappings;
            }

            return essayPackage;
        });

        return Response.formatServiceReturn(true, 200, result, null);
    } catch (err) {
        if (err instanceof EssayPackageError) {
            return Response.formatServiceReturn(false, 500, null, err.message);
        }

        throw err;
    }
};

const deleteEssayPackage = async (input, opts = {}) => {
    const language = opts.lang;

    const essay = await ProductPackageRepository.findOne(input);

    if (!essay) {
        return Response.formatServiceReturn(false, 404, null, language.ESSAY_PACKAGE.NOT_FOUND);
    }

    await ProductPackageRepository.delete({ id: essay.id });

    return Response.formatServiceReturn(true, 200, null, language.ESSAY_PACKAGE.DELETE_SUCCESS);
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
