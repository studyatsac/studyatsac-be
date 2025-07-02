const sequelize = require('../../models/mysql');
const EssayRepository = require('../../repositories/mysql/essay');
const EssayItemRepository = require('../../repositories/mysql/essay_item');
const Response = require('../../utils/response');

const getAllEssay = async (input, opts = {}) => {
    const language = opts.lang;

    const allEssay = await EssayRepository.findAll();

    if (!allEssay) {
        return Response.formatServiceReturn(false, 404, null, language.ESSAY.NOT_FOUND);
    }

    return Response.formatServiceReturn(true, 200, allEssay.toJSON(), null);
};

const getAllActiveEssay = async (input, opts = {}) => {
    const language = opts.lang;

    const allActiveEssay = await EssayRepository.findAll({ isActive: true });

    if (!allActiveEssay) {
        return Response.formatServiceReturn(false, 404, null, language.ESSAY.NOT_FOUND);
    }

    return Response.formatServiceReturn(true, 200, allActiveEssay.toJSON(), null);
};

const createEssay = async (input, opts = {}) => {
    const language = opts.lang;

    try {
        const result = await sequelize.transaction(async (trx) => {
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
                })));
                if (!essayItems) throw new Error();

                essay.essayItems = essayItems;
            }

            return essay;
        });

        return Response.formatServiceReturn(true, 200, result.toJSON(), null);
    } catch {
        return Response.formatServiceReturn(false, 500, null, language.ESSAY.CREATE_FAILED);
    }
};

exports.getAllEssay = getAllEssay;
exports.getAllActiveEssay = getAllActiveEssay;
exports.createEssay = createEssay;

module.exports = exports;
