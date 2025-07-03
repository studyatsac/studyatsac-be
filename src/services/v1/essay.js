const sequelize = require('../../models/mysql');
const EssayRepository = require('../../repositories/mysql/essay');
const EssayItemRepository = require('../../repositories/mysql/essay_item');
const Response = require('../../utils/response');
const LogUtils = require('../../utils/logger');
const Models = require('../../models/mysql');

const getEssay = async (input, opts = {}) => {
    const language = opts.lang;

    const allEssay = await EssayRepository.findOne({ id: input.id }, { include: Models.EssayItem });

    if (!allEssay) {
        return Response.formatServiceReturn(false, 404, null, language.ESSAY.NOT_FOUND);
    }

    return Response.formatServiceReturn(true, 200, allEssay, null);
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
        const result = await sequelize.sequelize.transaction(async (trx) => {
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

const deleteEssay = async (input, opts = {}) => {
    const language = opts.lang;

    const essay = await EssayRepository.findOne({ id: input.id });

    if (!essay) {
        return Response.formatServiceReturn(false, 404, null, language.ESSAY.NOT_FOUND);
    }

    await EssayRepository.delete({ id: input.id });

    return Response.formatServiceReturn(true, 200, null, language.ESSAY.DELETE_SUCCESS);
};

const updateEssay = async (input, opts = {}) => {
    const language = opts.lang;

    let essay = await EssayRepository.findOne(
        { id: input.id },
        {
            attributes: ['id'],
            include: { model: Models.EssayItem, attributes: ['id', 'uuid'] }
        }
    );

    if (!essay) {
        return Response.formatServiceReturn(false, 404, null, language.ESSAY.NOT_FOUND);
    }

    try {
        const result = await sequelize.sequelize.transaction(async (trx) => {
            essay = await EssayRepository.update(
                {
                    title: input.title,
                    description: input.description,
                    isActive: input.isActive
                },
                { id: input.id },
                trx
            );
            if (!essay) throw new Error();

            if (input.essayItems && Array.isArray(input.essayItems)) {
                let essayItemInputs = input.essayItems;
                if (essay.essayItems && Array.isArray(essay.essayItems)) {
                    const deletedEssayItems = essay.essayItems.filter(
                        (item) => !input.essayItems.find((i) => i.uuid === item.uuid)
                    );
                    if (deletedEssayItems.length) {
                        const deleteCount = await EssayItemRepository.delete({
                            id: { [sequelize.sequelize.Op.in]: deletedEssayItems.map((item) => item.id) }
                        }, trx);
                        // eslint-disable-next-line max-depth
                        if (!deleteCount) throw new Error();
                    }

                    essayItemInputs = essayItemInputs.map((item) => ({
                        ...(essay.essayItems.find((i) => i.uuid === item.uuid) || {}),
                        ...item
                    }));
                }

                const updatingEssayItems = essayItemInputs.map(async (item) => {
                    const updatedItem = await EssayItemRepository.creatOrUpdate({
                        essayId: essay.id,
                        number: item.number,
                        topic: item.topic,
                        description: item.description,
                        systemPrompt: item.systemPrompt,
                        id: item.id
                    }, trx);
                    if (!updatedItem) throw new Error();
                });

                await Promise.all(updatingEssayItems);

                essay.essayItems = essayItemInputs;
            }

            return essay;
        });

        return Response.formatServiceReturn(true, 200, result, null);
    } catch (err) {
        LogUtils.loggingError({ functionName: 'createEssay', message: err.message });

        return Response.formatServiceReturn(false, 500, null, language.ESSAY.UPDATE_FAILED);
    }
};

exports.getEssay = getEssay;
exports.getAllEssay = getAllEssay;
exports.createEssay = createEssay;
exports.deleteEssay = deleteEssay;
exports.updateEssay = updateEssay;

module.exports = exports;
