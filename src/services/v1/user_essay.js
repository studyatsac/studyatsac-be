const EssayRepository = require('../../repositories/mysql/essay');
const UserEssayRepository = require('../../repositories/mysql/user_essay');
const UserEssayItemRepository = require('../../repositories/mysql/user_essay_item');
const Response = require('../../utils/response');
const Models = require('../../models/mysql');
const Helpers = require('../../utils/helpers');
const sequelize = require('../../models/mysql');
const LogUtils = require('../../utils/logger');

const getUserEssay = async (input, opts = {}) => {
    const language = opts.lang;

    const essay = await UserEssayRepository.findOne(
        { uuid: input.uuid },
        {
            include: [
                { model: Models.User, as: 'user' },
                { model: Models.Essay, as: 'essay' },
                { model: Models.UserEssayItem, as: 'essayItems' }
            ]
        }
    );
    if (!essay) {
        return Response.formatServiceReturn(false, 404, null, language.USER_ESSAY.NOT_FOUND);
    }

    return Response.formatServiceReturn(true, 200, essay, null);
};

const getAllUserEssayAndCount = async (input, opts = {}) => {
    const language = opts.lang;

    const allUserEssay = await UserEssayRepository.findAndCountAll(input, {
        include: [
            { model: Models.User, as: 'user' },
            { model: Models.Essay, as: 'essay' }
        ],
        order: [['created_at', 'desc']],
        limit: input.limit,
        offset: Helpers.setOffset(input.page, input.limit)
    });

    if (!allUserEssay) {
        return Response.formatServiceReturn(false, 404, null, language.USER_ESSAY.NOT_FOUND);
    }

    return Response.formatServiceReturn(true, 200, allUserEssay, null);
};

const createUserEssay = async (input, opts = {}, isRestricted = false) => {
    const language = opts.lang;

    const essay = await EssayRepository.findOne(
        { uuid: input.essayUuid },
        {
            attributes: ['id'],
            include: { model: Models.EssayItem, attributes: ['id', 'uuid'], as: 'essayItems' }
        }
    );
    if (!essay) {
        return Response.formatServiceReturn(false, 404, null, language.ESSAY.NOT_FOUND);
    }

    let inputEssayItems = [];
    if (input.essayItems && Array.isArray(input.essayItems)) {
        inputEssayItems = input.essayItems;
        for (let index = 0; index < inputEssayItems.length; index++) {
            const essayItem = essay.essayItems.find((item) => item.uuid === inputEssayItems[index].essayItemUuid);
            if (!essayItem) {
                return Response.formatServiceReturn(false, 404, null, language.ESSAY_ITEM.NOT_FOUND);
            }
            inputEssayItems[index] = { ...inputEssayItems[index], essayItemId: essayItem.id };
        }
    }

    try {
        const result = await sequelize.sequelize.transaction(async (trx) => {
            const userEssay = await UserEssayRepository.create(
                {
                    essayId: input.title,
                    ...(!isRestricted ? { overallReview: input.overallReview } : {})
                },
                trx
            );
            if (!essay) throw new Error();

            if (inputEssayItems.length) {
                const essayItems = await UserEssayItemRepository.createMany(
                    inputEssayItems.map((item) => ({
                        userEssayId: userEssay.id,
                        essayItemId: item.essayItemId,
                        answer: item.answer,
                        ...(!isRestricted ? { review: item.review } : {})
                    })),
                    trx
                );
                if (!essayItems) throw new Error();

                userEssay.essayItems = essayItems;
            }

            return userEssay;
        });

        return Response.formatServiceReturn(true, 200, result, null);
    } catch (err) {
        LogUtils.loggingError({
            functionName: 'createUserEssay',
            message: err.message
        });

        return Response.formatServiceReturn(false, 500, null, language.USER_ESSAY.CREATE_FAILED);
    }
};

exports.getUserEssay = getUserEssay;
exports.getAllUserEssayAndCount = getAllUserEssayAndCount;
exports.createUserEssay = createUserEssay;

module.exports = exports;
