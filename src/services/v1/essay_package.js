const EssayPackageRepository = require('../../repositories/mysql/essay_package');
const EssayPackageMappingRepository = require('../../repositories/mysql/essay_package_mapping');
const Response = require('../../utils/response');
const LogUtils = require('../../utils/logger');
const Models = require('../../models/mysql');
const Helpers = require('../../utils/helpers');
const EssayRepository = require('../../repositories/mysql/essay');

const getEssayPackage = async (input, opts = {}) => {
    const language = opts.lang;

    const essay = await EssayPackageRepository.findOne(
        input,
        { include: { model: Models.EssayPackageMapping, as: 'essayPackageMappings' } }
    );
    if (!essay) {
        return Response.formatServiceReturn(false, 404, null, language.ESSAY_PACKAGE.NOT_FOUND);
    }

    return Response.formatServiceReturn(true, 200, essay, null);
};

const getAllEssayPackage = async (input, opts = {}) => {
    const language = opts.lang;

    const allEssayPackage = await EssayPackageRepository.findAll(input);

    if (!allEssayPackage) {
        return Response.formatServiceReturn(false, 404, null, language.ESSAY_PACKAGE.NOT_FOUND);
    }

    return Response.formatServiceReturn(true, 200, allEssayPackage, null);
};

const getAllEssayPackageAndCount = async (input, opts = {}) => {
    const language = opts.lang;
    const params = opts.params;

    const allEssayPackage = await EssayPackageRepository.findAndCountAll({
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
        offset: Helpers.setOffset(params.page, params.limit),
        subQuery: false
    });

    if (!allEssayPackage) {
        return Response.formatServiceReturn(false, 404, null, language.USER_ESSAY.NOT_FOUND);
    }

    return Response.formatServiceReturn(true, 200, allEssayPackage, null);
};

const createEssayPackage = async (input, opts = {}) => {
    const language = opts.lang;

    let inputEssayPackageMappings = [];
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
        }
    }

    try {
        const result = await Models.sequelize.transaction(async (trx) => {
            const essayPackage = await EssayPackageRepository.create({
                title: input.title,
                description: input.description,
                additionalInformation: input.additionalInformation,
                price: input.price,
                totalMaxAttempt: input.totalMaxAttempt,
                defaultItemMaxAttempt: input.defaultItemMaxAttempt,
                isActive: input.isActive
            }, trx);
            if (!essayPackage) throw new Error();

            if (inputEssayPackageMappings.length) {
                const essayPackageMappings = await EssayPackageMappingRepository.createMany(inputEssayPackageMappings.map((item) => ({
                    essayPackageId: essayPackage.id,
                    essayId: item.essayId,
                    maxAttempt: item.maxAttempt
                })), trx);
                if (!essayPackageMappings) throw new Error();

                essayPackage.essayPackageMappings = essayPackageMappings;
            }

            return essayPackage;
        });

        return Response.formatServiceReturn(true, 200, result, null);
    } catch (err) {
        LogUtils.loggingError({ functionName: 'createEssayPackage', message: err.message });

        return Response.formatServiceReturn(false, 500, null, language.ESSAY_PACKAGE.CREATE_FAILED);
    }
};

const updateEssayPackage = async (input, opts = {}) => {
    const language = opts.lang;

    const essayPackage = await EssayPackageRepository.findOne(
        { uuid: input.uuid },
        { include: { model: Models.EssayPackageMapping, attributes: ['id', 'uuid'], as: 'essayPackageMappings' } }
    );

    if (!essayPackage) {
        return Response.formatServiceReturn(false, 404, null, language.ESSAY_PACKAGE.NOT_FOUND);
    }

    let inputEssayPackageMappings = [];
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
        }
    }

    try {
        const result = await Models.sequelize.transaction(async (trx) => {
            const updatedItem = await EssayPackageRepository.update(
                {
                    title: input.title,
                    description: input.description,
                    additionalInformation: input.additionalInformation,
                    price: input.price,
                    totalMaxAttempt: input.totalMaxAttempt,
                    defaultItemMaxAttempt: input.defaultItemMaxAttempt,
                    isActive: input.isActive
                },
                { id: essayPackage.id },
                trx
            );
            if (!updatedItem) throw new Error();

            if (hasEssayPackageMappings) {
                if (essayPackage.essayPackageMappings && Array.isArray(essayPackage.essayPackageMappings)) {
                    const deletedEssayPackageMappings = essayPackage.essayPackageMappings.filter(
                        (item) => !inputEssayPackageMappings.find((i) => i.uuid === item.uuid)
                    );
                    if (deletedEssayPackageMappings.length) {
                        const deleteCount = await EssayPackageMappingRepository.delete(
                            { id: deletedEssayPackageMappings.map((item) => item.id) },
                            { force: true },
                            trx
                        );
                        // eslint-disable-next-line max-depth
                        if (!deleteCount) throw new Error();
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
                    const updatedEssayPackageMapping = await EssayPackageMappingRepository.creatOrUpdate({
                        id: item.id,
                        essayPackageId: essayPackage.id,
                        essayId: item.essayId,
                        maxAttempt: item.maxAttempt
                    }, trx);
                    if (!updatedEssayPackageMapping) throw new Error();
                });

                await Promise.all(updatingEssayPackageMappings);

                essayPackage.essayPackageMappings = inputEssayPackageMappings;
            }

            return essayPackage;
        });

        return Response.formatServiceReturn(true, 200, result, null);
    } catch (err) {
        LogUtils.loggingError({ functionName: 'updateEssayPackage', message: err.message });

        return Response.formatServiceReturn(false, 500, null, language.ESSAY_PACKAGE.UPDATE_FAILED);
    }
};

const deleteEssayPackage = async (input, opts = {}) => {
    const language = opts.lang;

    const essay = await EssayPackageRepository.findOne({ uuid: input.uuid });

    if (!essay) {
        return Response.formatServiceReturn(false, 404, null, language.ESSAY_PACKAGE.NOT_FOUND);
    }

    await EssayPackageRepository.delete({ uuid: input.uuid });

    return Response.formatServiceReturn(true, 200, null, language.ESSAY_PACKAGE.DELETE_SUCCESS);
};

exports.getEssayPackage = getEssayPackage;
exports.getAllEssayPackage = getAllEssayPackage;
exports.getAllEssayPackageAndCount = getAllEssayPackageAndCount;
exports.createEssayPackage = createEssayPackage;
exports.updateEssayPackage = updateEssayPackage;
exports.deleteEssayPackage = deleteEssayPackage;

module.exports = exports;
