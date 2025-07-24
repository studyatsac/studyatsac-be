const Response = require('../../utils/response');
const ProductPackageRepository = require('../../repositories/mysql/product_package');
const UserEssayRepository = require('../../repositories/mysql/user_essay');
const UserEssayItemRepository = require('../../repositories/mysql/user_essay_item');
const Models = require('../../models/mysql');
const Queues = require('../../queues/bullmq');
const UserEssayConstants = require('../../constants/user_essay');
const EssayReviewConstants = require('../../constants/essay_review');
const ProductPackageConstants = require('../../constants/product_package');
const EssayRepository = require('../../repositories/mysql/essay');
const EssayReviewUtils = require('../../utils/essay_review');

class EssayReviewError extends Error {}

const getPaidEssayReviewPackage = async (input, opts = {}) => {
    const language = opts.lang;

    const rawProductPackage = await ProductPackageRepository.findOneWithEssayAttemptFormUserPurchase({
        ...input,
        type: ProductPackageConstants.TYPE.ESSAY,
        uuid: input.essayPackageUuid,
        userId: input.userId,
        essayUuid: input.essayUuid
    });

    let productPackage = rawProductPackage;
    if (Array.isArray(rawProductPackage)) productPackage = rawProductPackage[0];
    if (!productPackage) {
        return Response.formatServiceReturn(false, 404, null, language.ESSAY_PACKAGE.NOT_FOUND);
    }

    return Response.formatServiceReturn(true, 200, productPackage, null);
};

const retryEssayReview = async (input, opts = {}) => {
    const language = opts.lang;

    const userEssay = await UserEssayRepository.findOne(
        { uuid: input.uuid, userId: input.userId },
        {
            include: {
                model: Models.UserEssayItem,
                as: 'essayItems',
                attributes: ['id', 'uuid', 'reviewStatus']
            }
        }
    );
    if (!userEssay) {
        return Response.formatServiceReturn(false, 404, null, language.USER_ESSAY.NOT_FOUND);
    }

    try {
        let shouldAddJob = false;
        await Models.sequelize.transaction(async (trx) => {
            let shouldUpdate = userEssay.overallReviewStatus === UserEssayConstants.STATUS.FAILED;
            let payload = {};
            if (shouldUpdate) payload = { overallReviewStatus: UserEssayConstants.STATUS.QUEUED };

            const failedItems = userEssay.essayItems.filter((item) => item.reviewStatus === UserEssayConstants.STATUS.FAILED);
            if (failedItems.length) {
                const failedItemIds = failedItems.map((item) => item.id);
                const updatedItem = await UserEssayItemRepository.update(
                    { reviewStatus: UserEssayConstants.STATUS.QUEUED },
                    { id: failedItemIds },
                    trx
                );

                if ((Array.isArray(updatedItem) && !updatedItem[0]) || !updatedItem) {
                    throw new EssayReviewError(language.USER_ESSAY_ITEM.UPDATE_FAILED);
                }

                shouldAddJob = true;
                shouldUpdate = true;

                payload.itemReviewStatus = UserEssayConstants.STATUS.QUEUED;
            }

            if (shouldUpdate) {
                const updatedItem = await UserEssayRepository.update(payload, { id: userEssay.id }, trx);

                if (!updatedItem) throw new EssayReviewError(language.USER_ESSAY.UPDATE_FAILED);

                shouldAddJob = true;
            }
        });

        if (shouldAddJob && userEssay) {
            Queues.EssayReviewEntry.add(
                EssayReviewConstants.JOB_NAME.ENTRY,
                JSON.stringify({ userEssayId: userEssay.id })
            );
        }

        return Response.formatServiceReturn(true, 200, userEssay, null);
    } catch (err) {
        if (err instanceof EssayReviewError) {
            return Response.formatServiceReturn(false, 500, null, err.message);
        }

        throw err;
    }
};

const continueEssayReview = async (input, opts = {}) => {
    const language = opts.lang;

    const userEssay = await UserEssayRepository.findOne(
        { uuid: input.uuid, userId: input.userId },
        {
            include: {
                model: Models.UserEssayItem,
                as: 'essayItems',
                include: { model: Models.EssayItem, as: 'essayItem', attributes: ['id', 'uuid'] }
            }
        }
    );
    if (!userEssay) {
        return Response.formatServiceReturn(false, 404, null, language.USER_ESSAY.NOT_FOUND);
    }

    const essay = await EssayRepository.findOne(
        { id: userEssay.essayId },
        { include: { model: Models.EssayItem, attributes: ['id', 'uuid'], as: 'essayItems' } }
    );
    if (!essay) {
        return Response.formatServiceReturn(false, 404, null, language.ESSAY.NOT_FOUND);
    }

    let inputEssayItems = [];
    if (input.essayItems && Array.isArray(input.essayItems)) {
        inputEssayItems = EssayReviewUtils.uniqInputEssayItems(input.essayItems);
        for (let index = 0; index < inputEssayItems.length; index++) {
            const userEssayItem = userEssay.essayItems?.find(
                (item) => item.essayItem.uuid === inputEssayItems[index].essayItemUuid
            );
            if (userEssayItem) {
                return Response.formatServiceReturn(false, 404, null, language.USER_ESSAY_ITEM.ALREADY_EXIST);
            }

            const essayItem = essay.essayItems.find((item) => item.uuid === inputEssayItems[index].essayItemUuid);
            if (!essayItem) {
                return Response.formatServiceReturn(false, 404, null, language.ESSAY_ITEM.NOT_FOUND);
            }
            inputEssayItems[index] = { ...inputEssayItems[index], essayItemId: essayItem.id };
        }
    }

    try {
        let shouldAddJob = false;
        await Models.sequelize.transaction(async (trx) => {
            let shouldUpdate = userEssay.overallReviewStatus === UserEssayConstants.STATUS.NOT_STARTED;
            shouldUpdate = shouldUpdate && (inputEssayItems.length + (userEssay.essayItems?.length ?? 0) === essay.essayItems.length);
            let payload = {};
            if (shouldUpdate) payload = { overallReviewStatus: UserEssayConstants.STATUS.QUEUED };

            if (inputEssayItems.length) {
                const essayItems = await UserEssayItemRepository.createMany(
                    inputEssayItems.map((item) => ({
                        userEssayId: userEssay.id,
                        essayItemId: item.essayItemId,
                        answer: item.answer,
                        reviewStatus: UserEssayConstants.STATUS.QUEUED
                    })),
                    trx
                );
                if (!essayItems) throw new EssayReviewError(language.USER_ESSAY_ITEM.CREATE_FAILED);

                userEssay.essayItems = [...(userEssay?.essayItems ?? []), ...essayItems];

                shouldAddJob = true;
                shouldUpdate = true;

                payload.itemReviewStatus = UserEssayConstants.STATUS.QUEUED;
            }

            if (shouldUpdate) {
                const updatedItem = await UserEssayRepository.update(payload, { id: userEssay.id }, trx);

                if ((Array.isArray(updatedItem) && !updatedItem[0]) || !updatedItem) {
                    throw new EssayReviewError(language.USER_ESSAY.UPDATE_FAILED);
                }

                shouldAddJob = true;
            }
        });

        if (shouldAddJob && userEssay) {
            Queues.EssayReviewEntry.add(
                EssayReviewConstants.JOB_NAME.ENTRY,
                JSON.stringify({ userEssayId: userEssay.id })
            );
        }

        return Response.formatServiceReturn(true, 200, userEssay, null);
    } catch (err) {
        if (err instanceof EssayReviewError) {
            return Response.formatServiceReturn(false, 500, null, err.message);
        }

        throw err;
    }
};

exports.getPaidEssayReviewPackage = getPaidEssayReviewPackage;
exports.retryEssayReview = retryEssayReview;
exports.continueEssayReview = continueEssayReview;

module.exports = exports;
