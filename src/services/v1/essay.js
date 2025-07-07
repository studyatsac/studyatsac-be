const EssayRepository = require('../../repositories/mysql/essay');
const EssayItemRepository = require('../../repositories/mysql/essay_item');
const Response = require('../../utils/response');
const LogUtils = require('../../utils/logger');
const Models = require('../../models/mysql');

const getEssay = async (input, opts = {}) => {
    const language = opts.lang;

    const essay = await EssayRepository.findOne(
        input,
        { include: { model: Models.EssayItem, as: 'essayItems' } }
    );
    if (!essay) {
        return Response.formatServiceReturn(false, 404, null, language.ESSAY.NOT_FOUND);
    }

    return Response.formatServiceReturn(true, 200, essay, null);
};

const getAllEssay = async (input, opts = {}) => {
    const language = opts.lang;

    const allEssay = await EssayRepository.findAll(input);

    if (!allEssay) {
        return Response.formatServiceReturn(false, 404, null, language.ESSAY.NOT_FOUND);
    }

    return Response.formatServiceReturn(true, 200, allEssay, null);
};

const createEssay = async (input, opts = {}) => {
    const language = opts.lang;

    try {
        const result = await Models.sequelize.transaction(async (trx) => {
            const essay = await EssayRepository.create({
                title: input.title,
                description: input.description,
                isActive: input.isActive
            }, trx);
            if (!essay) throw new Error();

            if (input.essayItems && Array.isArray(input.essayItems)) {
                const essayItems = await EssayItemRepository.createMany(input.essayItems.map((item) => ({
                    essayId: essay.id,
                    number: item.number,
                    topic: item.topic,
                    description: item.description,
                    systemPrompt: item.systemPrompt
                })), trx);
                if (!essayItems) throw new Error();

                essay.essayItems = essayItems;
            }

            return essay;
        });

        return Response.formatServiceReturn(true, 200, result, null);
    } catch (err) {
        LogUtils.loggingError({ functionName: 'createEssay', message: err.message });

        return Response.formatServiceReturn(false, 500, null, language.ESSAY.CREATE_FAILED);
    }
};

const updateEssay = async (input, opts = {}) => {
    const language = opts.lang;

    const essay = await EssayRepository.findOne(
        { uuid: input.uuid },
        { include: { model: Models.EssayItem, attributes: ['id', 'uuid'], as: 'essayItems' } }
    );

    if (!essay) {
        return Response.formatServiceReturn(false, 404, null, language.ESSAY.NOT_FOUND);
    }

    try {
        const result = await Models.sequelize.transaction(async (trx) => {
            const updatedItem = await EssayRepository.update(
                {
                    title: input.title,
                    description: input.description,
                    isActive: input.isActive
                },
                { id: essay.id },
                trx
            );
            if (!updatedItem) throw new Error();

            if (input.essayItems && Array.isArray(input.essayItems)) {
                let inputEssayItems = input.essayItems;
                if (essay.essayItems && Array.isArray(essay.essayItems)) {
                    const deletedEssayItems = essay.essayItems.filter(
                        (item) => !input.essayItems.find((i) => i.uuid === item.uuid)
                    );
                    if (deletedEssayItems.length) {
                        const deleteCount = await EssayItemRepository.delete(
                            { id: deletedEssayItems.map((item) => item.id) },
                            { force: true },
                            trx
                        );
                        // eslint-disable-next-line max-depth
                        if (!deleteCount) throw new Error();
                    }

                    inputEssayItems = inputEssayItems.map((item) => {
                        const essayItem = essay.essayItems.find((i) => i.uuid === item.uuid);
                        return ({
                            ...item,
                            ...(essayItem && { id: essayItem.id })
                        });
                    });
                }

                const updatingEssayItems = inputEssayItems.map(async (item) => {
                    const updatedEssayItem = await EssayItemRepository.creatOrUpdate({
                        id: item.id,
                        essayId: essay.id,
                        number: item.number,
                        topic: item.topic,
                        description: item.description,
                        systemPrompt: item.systemPrompt
                    }, trx);
                    if (!updatedEssayItem) throw new Error();
                });

                await Promise.all(updatingEssayItems);

                essay.essayItems = inputEssayItems;
            }

            return essay;
        });

        return Response.formatServiceReturn(true, 200, result, null);
    } catch (err) {
        LogUtils.loggingError({ functionName: 'createEssay', message: err.message });

        return Response.formatServiceReturn(false, 500, null, language.ESSAY.UPDATE_FAILED);
    }
};

const deleteEssay = async (input, opts = {}) => {
    const language = opts.lang;

    const essay = await EssayRepository.findOne({ uuid: input.uuid });

    if (!essay) {
        return Response.formatServiceReturn(false, 404, null, language.ESSAY.NOT_FOUND);
    }

    await EssayRepository.delete({ uuid: input.uuid });

    return Response.formatServiceReturn(true, 200, null, language.ESSAY.DELETE_SUCCESS);
};

exports.getEssay = getEssay;
exports.getAllEssay = getAllEssay;
exports.createEssay = createEssay;
exports.updateEssay = updateEssay;
exports.deleteEssay = deleteEssay;

module.exports = exports;
