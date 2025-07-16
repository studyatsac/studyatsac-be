const Response = require('../../utils/response');
const EssayPackageRepository = require('../../repositories/mysql/essay_package');
const UserEssayRepository = require('../../repositories/mysql/user_essay');
const UserEssayItemRepository = require('../../repositories/mysql/user_essay_item');
const Models = require('../../models/mysql');
const Queues = require('../../queues/redis');
const UserEssayConstants = require('../../constants/user_essay');
const EssayReviewConstants = require('../../constants/essay_review');

class EssayReviewError extends Error {}

const getPaidEssayReviewPackage = async (input, opts = {}) => {
    const language = opts.lang;

    const essay = await EssayPackageRepository.findOneWithAttemptFormUserPurchase({
        ...input,
        uuid: input.essayPackageUuid,
        userId: input.userId,
        essayUuid: input.essayUuid
    });

    let essayPackage = essay;
    if (Array.isArray(essay)) essayPackage = essay[0];
    if (!essayPackage) {
        return Response.formatServiceReturn(false, 404, null, language.ESSAY_PACKAGE.NOT_FOUND);
    }

    return Response.formatServiceReturn(true, 200, essayPackage, null);
};

const retryEssayReview = async (input, opts = {}) => {
    const language = opts.lang;

    const userEssay = await UserEssayRepository.findOne(
        { uuid: input.uuid, userId: input.userId },
        {
            include: {
                model: Models.UserEssayItem,
                as: 'essayItems'
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
            if (shouldUpdate) payload = { overallReviewStatus: UserEssayConstants.STATUS.PENDING };

            const failedItems = userEssay.essayItems.filter((item) => item.reviewStatus === UserEssayConstants.STATUS.FAILED);
            if (failedItems.length) {
                const failedItemIds = failedItems.map((item) => item.id);
                const updatedItem = await UserEssayItemRepository.update(
                    { reviewStatus: UserEssayConstants.STATUS.PENDING },
                    { id: failedItemIds },
                    trx
                );

                if ((Array.isArray(updatedItem) && !updatedItem[0]) || !updatedItem) {
                    throw new EssayReviewError(language.USER_ESSAY_ITEM.UPDATE_FAILED);
                }

                shouldAddJob = true;
                shouldUpdate = true;

                payload.itemReviewStatus = UserEssayConstants.STATUS.PENDING;
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

module.exports = exports;
