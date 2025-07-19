const ProductPackageRepository = require('../../repositories/mysql/product_package');
const ProductPackageMappingRepository = require('../../repositories/mysql/product_package_mapping');
const ProductRepository = require('../../repositories/mysql/product');
const Response = require('../../utils/response');
const Models = require('../../models/mysql');
const Helpers = require('../../utils/helpers');
const EssayRepository = require('../../repositories/mysql/essay');
const ProductPackageConstants = require('../../constants/product_package');

class EssayPackageError extends Error {}

const getEssayPackage = async (input, opts = {}) => {
    const language = opts.lang;

    const productPackage = await ProductPackageRepository.findOne(
        { ...input, type: ProductPackageConstants.TYPE.ESSAY },
        {
            include: [
                {
                    model: Models.ProductPackageMapping,
                    as: 'productPackageMappings',
                    include: { model: Models.Essay, as: 'essay' }
                },
                {
                    model: Models.Product,
                    as: 'product'
                }
            ]
        }
    );
    if (!productPackage) {
        return Response.formatServiceReturn(false, 404, null, language.ESSAY_PACKAGE.NOT_FOUND);
    }

    return Response.formatServiceReturn(true, 200, productPackage, null);
};

const getPaidEssayPackage = async (input, opts = {}) => {
    const language = opts.lang;

    const rawProductPackage = await ProductPackageRepository.findOneWithMappingFromUserPurchase({
        ...input,
        type: ProductPackageConstants.TYPE.ESSAY
    });
    if (!rawProductPackage) {
        return Response.formatServiceReturn(false, 404, null, language.ESSAY_PACKAGE.NOT_FOUND);
    }

    let productPackage = rawProductPackage;
    if (Array.isArray(rawProductPackage)) {
        productPackage = rawProductPackage[0];
        productPackage.productPackageMappings = rawProductPackage.map((item) => item.productPackageMappings);
    }

    return Response.formatServiceReturn(true, 200, productPackage, null);
};

const getAllEssayPackage = async (input, opts = {}) => {
    const language = opts.lang;

    const allProductPackage = await ProductPackageRepository.findAll({
        ...input,
        type: ProductPackageConstants.TYPE.ESSAY
    });

    if (!allProductPackage) {
        return Response.formatServiceReturn(false, 404, null, language.ESSAY_PACKAGE.NOT_FOUND);
    }

    return Response.formatServiceReturn(true, 200, allProductPackage, null);
};

const getAllEssayPackageAndCount = async (input, opts = {}) => {
    const language = opts.lang;
    const params = opts.params;

    const allProductPackage = await ProductPackageRepository.findAndCountAll({
        ...input,
        type: ProductPackageConstants.TYPE.ESSAY,
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

    if (!allProductPackage) {
        return Response.formatServiceReturn(false, 404, null, language.ESSAY_PACKAGE.NOT_FOUND);
    }

    return Response.formatServiceReturn(true, 200, allProductPackage, null);
};

const getAllMyEssayPackageAndCount = async (input, opts = {}) => {
    const language = opts.lang;
    const params = opts.params;

    const allPaidProductPackage = await ProductPackageRepository.findAndCountAllFromUserPurchase(
        { ...input, type: ProductPackageConstants.TYPE.ESSAY },
        {
            limit: params.limit,
            offset: Helpers.setOffset(params.page, params.limit)
        }
    );

    if (!allPaidProductPackage) {
        return Response.formatServiceReturn(false, 404, null, language.ESSAY_PACKAGE.NOT_FOUND);
    }

    return Response.formatServiceReturn(true, 200, allPaidProductPackage, null);
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

    try {
        const result = await Models.sequelize.transaction(async (trx) => {
            const productPackage = await ProductPackageRepository.create({
                type: ProductPackageConstants.TYPE.ESSAY,
                title: input.title,
                description: input.description,
                additionalInformation: input.additionalInformation,
                price: input.price,
                totalMaxAttempt,
                defaultItemMaxAttempt,
                paymentUrl: input.paymentUrl,
                isActive: input.isActive
            }, trx);
            if (!productPackage) throw new EssayPackageError(language.ESSAY_PACKAGE.CREATE_FAILED);

            const hasProduct = input.externalProductId
                || input.externalProductName
                || input.externalTicketId
                || input.externalTicketName;
            if (hasProduct) {
                const product = await ProductRepository.create({
                    productPackageId: productPackage.id,
                    externalProductId: input.externalProductId,
                    externalProductName: input.externalProductName,
                    externalTicketId: input.externalTicketId,
                    externalTicketName: input.externalTicketName
                }, trx);
                if (!product) throw new EssayPackageError(language.PRODUCT.CREATE_FAILED);

                productPackage.product = product;
            }

            if (inputProductPackageMappings.length) {
                const productPackageMappings = await ProductPackageMappingRepository.createMany(inputProductPackageMappings.map((item) => ({
                    productPackageId: productPackage.id,
                    essayId: item.essayId,
                    maxAttempt: item.maxAttempt
                })), trx);
                if (!productPackageMappings) throw new EssayPackageError(language.ESSAY_PACKAGE_MAPPING.CREATE_FAILED);

                productPackage.productPackageMappings = productPackageMappings;
            }

            return productPackage;
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

    const productPackage = await ProductPackageRepository.findOne(
        { uuid: input.uuid, type: ProductPackageConstants.TYPE.ESSAY },
        { include: { model: Models.ProductPackageMapping, attributes: ['id', 'uuid'], as: 'productPackageMappings' } }
    );

    if (!productPackage) {
        return Response.formatServiceReturn(false, 404, null, language.ESSAY_PACKAGE.NOT_FOUND);
    }

    let inputProductPackageMappings = [];
    let totalMaxAttempt = 0;
    let defaultItemMaxAttempt = 0;
    const hasEssayPackageMappings = input.essayPackageMappings && Array.isArray(input.essayPackageMappings);
    if (hasEssayPackageMappings) {
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

    const hasProduct = input.externalProductId
        || input.externalProductName
        || input.externalTicketId
        || input.externalTicketName;
    let productId;
    if (hasProduct) {
        const product = await ProductRepository.findOne({ productPackageId: productPackage.id });
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
                { id: productPackage.id },
                trx
            );
            if ((Array.isArray(updatedItem) && !updatedItem[0]) || !updatedItem) {
                throw new EssayPackageError(language.ESSAY_PACKAGE.UPDATE_FAILED);
            }

            if (hasProduct) {
                const product = await ProductRepository.createOrUpdate({
                    id: productId,
                    productPackageId: productPackage.id,
                    externalProductId: input.externalProductId,
                    externalProductName: input.externalProductName,
                    externalTicketId: input.externalTicketId,
                    externalTicketName: input.externalTicketName
                }, trx);
                if ((Array.isArray(product) && !product[0]) || !product) {
                    throw new EssayPackageError(language.PRODUCT.UPDATE_FAILED);
                }

                productPackage.product = product;
            }

            if (hasEssayPackageMappings) {
                if (productPackage.productPackageMappings && Array.isArray(productPackage.productPackageMappings)) {
                    const deletedEssayPackageMappings = productPackage.productPackageMappings.filter(
                        (item) => !inputProductPackageMappings.find((i) => i.uuid === item.uuid)
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

                    inputProductPackageMappings = inputProductPackageMappings.map((item) => {
                        const productItem = productPackage.productPackageMappings.find((i) => i.uuid === item.uuid);
                        return ({
                            ...item,
                            ...(productItem && { id: productItem.id })
                        });
                    });
                }

                const updatingEssayPackageMappings = inputProductPackageMappings.map(async (item) => {
                    const updatedEssayPackageMapping = await ProductPackageMappingRepository.createOrUpdate({
                        id: item.id,
                        productPackageId: productPackage.id,
                        essayId: item.essayId,
                        maxAttempt: item.maxAttempt
                    }, trx);
                    if ((Array.isArray(updatedEssayPackageMapping) && !updatedEssayPackageMapping[0]) || !updatedEssayPackageMapping) {
                        throw new EssayPackageError(language.ESSAY_PACKAGE_MAPPING.UPDATE_FAILED);
                    }
                });

                await Promise.all(updatingEssayPackageMappings);

                productPackage.productPackageMappings = inputProductPackageMappings;
            }

            return productPackage;
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

    const productPackage = await ProductPackageRepository.findOne({
        ...input,
        type: ProductPackageConstants.TYPE.ESSAY
    });

    if (!productPackage) {
        return Response.formatServiceReturn(false, 404, null, language.ESSAY_PACKAGE.NOT_FOUND);
    }

    await ProductPackageRepository.delete({ id: productPackage.id });

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
