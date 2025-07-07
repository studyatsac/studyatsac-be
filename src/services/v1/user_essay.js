const EssayRepository = require('../../repositories/mysql/essay');
const UserEssayRepository = require('../../repositories/mysql/user_essay');
const UserEssayItemRepository = require('../../repositories/mysql/user_essay_item');
const Response = require('../../utils/response');
const Models = require('../../models/mysql');
const Helpers = require('../../utils/helpers');
const LogUtils = require('../../utils/logger');
const Queues = require('../../queues/redis');
const EssayReviewConstants = require('../../constants/essay_review');

const getUserEssay = async (input, opts = {}) => {
    const language = opts.lang;

    const essay = await UserEssayRepository.findOne(
        { uuid: input.uuid },
        {
            include: [
                { model: Models.User, as: 'user' },
                {
                    model: Models.Essay,
                    as: 'essay',
                    ...(opts.isDetailed ? { include: { model: Models.EssayItem, as: 'essayItems' } } : {})
                },
                {
                    model: Models.UserEssayItem,
                    as: 'essayItems',
                    include: { model: Models.EssayItem, as: 'essayItem' }
                }
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
    const params = opts.params;

    let essayUuid;
    if (input && 'essayUuid' in input) {
        essayUuid = input.essayUuid;
        delete input.essayUuid;
    }

    const allUserEssay = await UserEssayRepository.findAndCountAll({
        ...input,
        ...(params.search ? {
            [Models.Op.or]: [
                {
                    '$user.full_name$': {
                        [Models.Op.like]: `%${params.search}%`
                    }
                },
                {
                    '$essay.title$': {
                        [Models.Op.like]: `%${params.search}%`
                    }
                }
            ]
        } : {})
    }, {
        include: [
            { model: Models.User, as: 'user' },
            { model: Models.Essay, as: 'essay', where: essayUuid ? { uuid: essayUuid } : undefined },
            // TODO: Optimize this query
            {
                model: Models.UserEssayItem,
                as: 'essayItems',
                attributes: ['id']
            }
        ],
        attributes: {
            include: [
                [
                    Models.sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM user_essay_items AS item
                        WHERE item.user_essay_id = UserEssay.id
                    )`),
                    'essayItemCount'
                ]
            ]
        },
        order: [['created_at', 'desc']],
        limit: params.limit,
        offset: Helpers.setOffset(params.page, params.limit),
        subQuery: false
    });

    if (!allUserEssay) {
        return Response.formatServiceReturn(false, 404, null, language.USER_ESSAY.NOT_FOUND);
    }

    return Response.formatServiceReturn(true, 200, allUserEssay, null);
};

const createUserEssay = async (input, opts = {}) => {
    const language = opts.lang;

    const essay = await EssayRepository.findOne(
        { uuid: input.essayUuid },
        { include: { model: Models.EssayItem, attributes: ['id', 'uuid'], as: 'essayItems' } }
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
        const result = await Models.sequelize.transaction(async (trx) => {
            const hasEssayItems = input.essayItems
                && Array.isArray(input.essayItems)
                && !!input.essayItems.length;

            const userEssay = await UserEssayRepository.create(
                {
                    userId: input.userId,
                    essayId: essay.id,
                    ...(opts.withReview ? ({
                        ...(hasEssayItems ? ({
                            itemReviewStatus: EssayReviewConstants.STATUS.PENDING
                        }) : {}),
                        overallReviewStatus: EssayReviewConstants.STATUS.PENDING
                    }) : {}),
                    ...(!opts.isRestricted ? { overallReview: input.overallReview } : {})
                },
                trx
            );
            if (!essay) throw new Error();

            if (hasEssayItems) {
                const essayItems = await UserEssayItemRepository.createMany(
                    inputEssayItems.map((item) => ({
                        userEssayId: userEssay.id,
                        essayItemId: item.essayItemId,
                        answer: item.answer,
                        ...(opts.withReview ? ({
                            reviewStatus: EssayReviewConstants.STATUS.PENDING
                        }) : {}),
                        ...(!opts.isRestricted ? { review: item.review } : {})
                    })),
                    trx
                );
                if (!essayItems) throw new Error();

                userEssay.essayItems = essayItems;
            }

            return userEssay;
        });

        if (result && opts.withReview) Queues.EssayReview.addJob(result);

        return Response.formatServiceReturn(true, 200, result, null);
    } catch (err) {
        LogUtils.loggingError({
            functionName: 'createUserEssay',
            message: err.message
        });

        return Response.formatServiceReturn(false, 500, null, language.USER_ESSAY.CREATE_FAILED);
    }
};

const updateUserEssay = async (input, opts = {}) => {
    const language = opts.lang;

    const userEssay = await UserEssayRepository.findOne(
        { uuid: input.uuid, ...(input.userId ? { userId: input.userId } : {}) },
        { include: { model: Models.UserEssayItem, attributes: ['id', 'uuid'], as: 'essayItems' } }
    );

    if (!userEssay) {
        return Response.formatServiceReturn(false, 404, null, language.USER_ESSAY.NOT_FOUND);
    }

    const essay = await EssayRepository.findOne(
        { uuid: input.essayUuid },
        { include: { model: Models.EssayItem, attributes: ['id', 'uuid'], as: 'essayItems' } }
    );

    if (!essay) {
        return Response.formatServiceReturn(false, 404, null, language.ESSAY.NOT_FOUND);
    }

    let inputEssayItems = [];
    if (input.essayItems && Array.isArray(input.essayItems)) {
        inputEssayItems = input.essayItems;
        for (let index = 0; index < inputEssayItems.length; index++) {
            // eslint-disable-next-line no-loop-func
            const essayItem = essay.essayItems.find((item) => item.uuid === inputEssayItems[index].essayItemUuid);
            if (!essayItem) {
                return Response.formatServiceReturn(false, 404, null, language.ESSAY_ITEM.NOT_FOUND);
            }
            inputEssayItems[index] = { ...inputEssayItems[index], essayItemId: essayItem.id };
        }
    }

    try {
        const result = await Models.sequelize.transaction(async (trx) => {
            let hasEssayItems = input.essayItems && Array.isArray(input.essayItems);

            if (hasEssayItems) {
                if (userEssay.essayItems && Array.isArray(userEssay.essayItems)) {
                    const deletedEssayItems = userEssay.essayItems.filter(
                        (item) => !inputEssayItems.find((i) => i.uuid === item.uuid)
                    );
                    if (deletedEssayItems.length) {
                        const deleteCount = await UserEssayItemRepository.delete(
                            { id: deletedEssayItems.map((item) => item.id) },
                            { force: true },
                            trx
                        );
                        // eslint-disable-next-line max-depth
                        if (!deleteCount) throw new Error();
                    }

                    inputEssayItems = inputEssayItems.map((item) => {
                        const essayItem = userEssay.essayItems.find((i) => i.uuid === item.uuid);
                        return ({
                            ...item,
                            ...(essayItem && { id: essayItem.id })
                        });
                    });
                }
            }

            hasEssayItems = hasEssayItems && !!inputEssayItems.length;

            const updatedItem = await UserEssayRepository.update(
                {
                    essayId: essay.id,
                    ...(opts.withReview ? ({
                        ...(hasEssayItems ? ({
                            itemReviewStatus: EssayReviewConstants.STATUS.PENDING
                        }) : {}),
                        overallReviewStatus: EssayReviewConstants.STATUS.PENDING
                    }) : {
                        ...(hasEssayItems ? ({
                            itemReviewStatus: EssayReviewConstants.STATUS.NEED_REVIEW
                        }) : {}),
                        overallReviewStatus: EssayReviewConstants.STATUS.NEED_REVIEW
                    }),
                    ...(!opts.isRestricted ? { overallReview: input.overallReview } : {})
                },
                { id: userEssay.id },
                trx
            );
            if (!updatedItem) throw new Error();

            if (hasEssayItems) {
                const updatingEssayItems = inputEssayItems.map(async (item) => {
                    const updatedEssayItem = await UserEssayItemRepository.creatOrUpdate({
                        id: item.id,
                        userEssayId: userEssay.id,
                        essayItemId: item.essayItemId,
                        answer: item.answer,
                        ...(opts.withReview ? ({
                            reviewStatus: EssayReviewConstants.STATUS.PENDING
                        }) : {
                            reviewStatus: EssayReviewConstants.STATUS.NEED_REVIEW
                        }),
                        ...(!opts.isRestricted ? { review: item.review } : {})
                    }, trx);
                    if (!updatedEssayItem) throw new Error();
                });

                await Promise.all(updatingEssayItems);

                userEssay.essayItems = inputEssayItems;
            }

            return userEssay;
        });

        if (result && opts.withReview) Queues.EssayReview.addJob(result);

        return Response.formatServiceReturn(true, 200, result, null);
    } catch (err) {
        LogUtils.loggingError({ functionName: 'createEssay', message: err.message });

        return Response.formatServiceReturn(false, 500, null, language.USER_ESSAY.UPDATE_FAILED);
    }
};

const deleteUserEssay = async (input, opts = {}) => {
    const language = opts.lang;

    const essay = await UserEssayRepository.findOne({ uuid: input.uuid });

    if (!essay) {
        return Response.formatServiceReturn(false, 404, null, language.USER_ESSAY.NOT_FOUND);
    }

    await UserEssayRepository.delete({ uuid: input.uuid });

    return Response.formatServiceReturn(true, 200, null, language.USER_ESSAY.DELETE_SUCCESS);
};

exports.getUserEssay = getUserEssay;
exports.getAllUserEssayAndCount = getAllUserEssayAndCount;
exports.createUserEssay = createUserEssay;
exports.updateUserEssay = updateUserEssay;
exports.deleteUserEssay = deleteUserEssay;

module.exports = exports;
