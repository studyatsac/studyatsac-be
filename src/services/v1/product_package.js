const ProductPackageRepository = require('../../repositories/mysql/product_package');
const ProductPackageMappingRepository = require('../../repositories/mysql/product_package_mapping');
const ProductRepository = require('../../repositories/mysql/product');
const Response = require('../../utils/response');
const Models = require('../../models/mysql');
const Helpers = require('../../utils/helpers');
const ProductPackageConstants = require('../../constants/product_package');

class ProductPackageError extends Error {}

const getProductPackage = async (input, opts = {}) => {
    const language = opts.lang;

    const productPackage = await ProductPackageRepository.findOne(
        input,
        {
            include: [
                {
                    ...(opts.productPackageMappingInclude ? opts.productPackageMappingInclude : {}),
                    model: Models.ProductPackageMapping,
                    as: 'productPackageMappings'
                },
                {
                    model: Models.Product,
                    as: 'product'
                }
            ]
        }
    );
    if (!productPackage) {
        return Response.formatServiceReturn(
            false,
            404,
            null,
            opts.notFoundMessage ?? language.PRODUCT_PACKAGE.NOT_FOUND
        );
    }

    return Response.formatServiceReturn(true, 200, productPackage, null);
};

const getPaidProductPackage = async (input, opts = {}) => {
    const language = opts.lang;

    let rawProductPackage;

    switch (input.type) {
    case ProductPackageConstants.TYPE.ESSAY:
        rawProductPackage = await ProductPackageRepository.findOneWithEssayMappingFromUserPurchase(input);
        break;
    case ProductPackageConstants.TYPE.INTERVIEW:
        rawProductPackage = await ProductPackageRepository.findOneWithInterviewMappingFromUserPurchase(input);
        break;
    default:
        break;
    }

    if (!rawProductPackage) {
        return Response.formatServiceReturn(
            false,
            404,
            null,
            opts.notFoundMessage ?? language.PRODUCT_PACKAGE.NOT_FOUND
        );
    }

    let productPackage = rawProductPackage;
    if (Array.isArray(rawProductPackage)) {
        productPackage = rawProductPackage[0];
        if (productPackage) {
            productPackage.productPackageMappings = rawProductPackage.map((item) => item.productPackageMappings);
        }
    }

    return Response.formatServiceReturn(true, 200, productPackage, null);
};

const getAllProductPackage = async (input, opts = {}) => {
    const language = opts.lang;

    const allProductPackage = await ProductPackageRepository.findAll(input);

    if (!allProductPackage) {
        return Response.formatServiceReturn(
            false,
            404,
            null,
            opts.notFoundMessage ?? language.PRODUCT_PACKAGE.NOT_FOUND
        );
    }

    return Response.formatServiceReturn(true, 200, allProductPackage, null);
};

const getAllProductPackageAndCount = async (input, opts = {}) => {
    const language = opts.lang;
    const params = opts.params;

    const allProductPackage = await ProductPackageRepository.findAndCountAll({
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

    if (!allProductPackage) {
        return Response.formatServiceReturn(
            false,
            404,
            null,
            opts.notFoundMessage ?? language.PRODUCT_PACKAGE.NOT_FOUND
        );
    }

    return Response.formatServiceReturn(true, 200, allProductPackage, null);
};

const getAllMyProductPackageAndCount = async (input, opts = {}) => {
    const language = opts.lang;
    const params = opts.params;

    const allPaidProductPackage = await ProductPackageRepository.findAndCountAllFromUserPurchase(
        input,
        {
            limit: params.limit,
            offset: Helpers.setOffset(params.page, params.limit)
        }
    );

    if (!allPaidProductPackage) {
        return Response.formatServiceReturn(
            false,
            404,
            null,
            opts.notFoundMessage ?? language.PRODUCT_PACKAGE.NOT_FOUND
        );
    }

    return Response.formatServiceReturn(true, 200, allPaidProductPackage, null);
};

const createProductPackage = async (input, opts = {}) => {
    const language = opts.lang;

    try {
        const result = await Models.sequelize.transaction(async (trx) => {
            const productPackage = await ProductPackageRepository.create({
                type: input.type,
                title: input.title,
                description: input.description,
                additionalInformation: input.additionalInformation,
                price: input.price,
                totalMaxAttempt: input.totalMaxAttempt,
                defaultItemMaxAttempt: input.defaultItemMaxAttempt,
                paymentUrl: input.paymentUrl,
                isActive: input.isActive
            }, trx);
            if (!productPackage) {
                throw new ProductPackageError(
                    opts.createFailedMessage ?? language.PRODUCT_PACKAGE.CREATE_FAILED
                );
            }

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
                if (!product) throw new ProductPackageError(language.PRODUCT.CREATE_FAILED);

                productPackage.product = product;
            }

            if (input.productPackageMappings && Array.isArray(input.productPackageMappings)) {
                const productPackageMappings = await ProductPackageMappingRepository.createMany(
                    input.productPackageMappings.map((item) => ({
                        productPackageId: productPackage.id,
                        ...(item.essayId != null ? { essayId: item.essayId } : {}),
                        ...(item.interviewId != null ? { interviewId: item.interviewId } : {}),
                        maxAttempt: item.maxAttempt
                    })),
                    trx
                );
                if (!productPackageMappings) {
                    throw new ProductPackageError(
                        opts.createNappingFailedMessage ?? language.PRODUCT_PACKAGE_MAPPING.CREATE_FAILED
                    );
                }

                productPackage.productPackageMappings = productPackageMappings;
            }

            return productPackage;
        });

        return Response.formatServiceReturn(true, 200, result, null);
    } catch (err) {
        if (err instanceof ProductPackageError) {
            return Response.formatServiceReturn(false, 500, null, err.message);
        }

        throw err;
    }
};

const updateProductPackage = async (input, opts = {}) => {
    const language = opts.lang;

    const productPackage = await ProductPackageRepository.findOne(
        { uuid: input.uuid, type: input.type },
        { include: { model: Models.ProductPackageMapping, attributes: ['id', 'uuid'], as: 'productPackageMappings' } }
    );

    if (!productPackage) {
        return Response.formatServiceReturn(
            false,
            404,
            null,
            opts.notFoundMessage ?? language.PRODUCT_PACKAGE.NOT_FOUND
        );
    }

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
                    totalMaxAttempt: input.totalMaxAttempt,
                    defaultItemMaxAttempt: input.defaultItemMaxAttempt,
                    paymentUrl: input.paymentUrl,
                    isActive: input.isActive
                },
                { id: productPackage.id },
                trx
            );
            if ((Array.isArray(updatedItem) && !updatedItem[0]) || !updatedItem) {
                throw new ProductPackageError(
                    opts.updateFailedMessage ?? language.PRODUCT_PACKAGE.UPDATE_FAILED
                );
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
                    throw new ProductPackageError(language.PRODUCT.UPDATE_FAILED);
                }

                productPackage.product = product;
            }

            let inputProductPackageMappings = [];
            let hasProductPackageMappings = false;
            if (input.productPackageMappings && Array.isArray(input.productPackageMappings)) {
                inputProductPackageMappings = input.productPackageMappings;
                hasProductPackageMappings = true;
            }

            if (hasProductPackageMappings) {
                if (productPackage.productPackageMappings && Array.isArray(productPackage.productPackageMappings)) {
                    const deletedProductPackageMappings = productPackage.productPackageMappings.filter(
                        (item) => !inputProductPackageMappings.find((i) => i.uuid === item.uuid)
                    );
                    if (deletedProductPackageMappings.length) {
                        const deleteCount = await ProductPackageMappingRepository.delete(
                            { id: deletedProductPackageMappings.map((item) => item.id) },
                            { force: true },
                            trx
                        );
                        // eslint-disable-next-line max-depth
                        if (!deleteCount) {
                            throw new ProductPackageError(
                                opts.deleteMappingFailedMessage ?? language.PRODUCT_PACKAGE_MAPPING.DELETE_FAILED
                            );
                        }
                    }

                    inputProductPackageMappings = inputProductPackageMappings.map((item) => {
                        const productItem = productPackage.productPackageMappings.find((i) => i.uuid === item.uuid);
                        return ({
                            ...item,
                            ...(productItem && { id: productItem.id })
                        });
                    });
                }

                const updatingProductPackageMappings = inputProductPackageMappings.map(async (item) => {
                    const updatedProductPackageMapping = await ProductPackageMappingRepository.createOrUpdate({
                        id: item.id,
                        productPackageId: productPackage.id,
                        ...(item.essayId != null ? { essayId: item.essayId } : {}),
                        ...(item.interviewId != null ? { interviewId: item.interviewId } : {}),
                        maxAttempt: item.maxAttempt
                    }, trx);
                    if ((Array.isArray(updatedProductPackageMapping) && !updatedProductPackageMapping[0]) || !updatedProductPackageMapping) {
                        throw new ProductPackageError(
                            opts.updateMappingFailedMessage ?? language.PRODUCT_PACKAGE_MAPPING.UPDATE_FAILED
                        );
                    }
                });

                await Promise.all(updatingProductPackageMappings);

                productPackage.productPackageMappings = inputProductPackageMappings;
            }

            return productPackage;
        });

        return Response.formatServiceReturn(true, 200, result, null);
    } catch (err) {
        if (err instanceof ProductPackageError) {
            return Response.formatServiceReturn(false, 500, null, err.message);
        }

        throw err;
    }
};

const deleteProductPackage = async (input, opts = {}) => {
    const language = opts.lang;

    const productPackage = await ProductPackageRepository.findOne(input);

    if (!productPackage) {
        return Response.formatServiceReturn(
            false,
            404,
            null,
            opts.notFoundMessage ?? language.PRODUCT_PACKAGE.NOT_FOUND
        );
    }

    await ProductPackageRepository.delete({ id: productPackage.id });

    return Response.formatServiceReturn(
        true,
        200,
        null,
        opts.deleteSuccessMessage ?? language.PRODUCT_PACKAGE.DELETE_SUCCESS
    );
};

exports.getProductPackage = getProductPackage;
exports.getPaidProductPackage = getPaidProductPackage;
exports.getAllProductPackage = getAllProductPackage;
exports.getAllProductPackageAndCount = getAllProductPackageAndCount;
exports.getAllMyProductPackageAndCount = getAllMyProductPackageAndCount;
exports.createProductPackage = createProductPackage;
exports.updateProductPackage = updateProductPackage;
exports.deleteProductPackage = deleteProductPackage;

module.exports = exports;
