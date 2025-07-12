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
        { uuid: input.essayPackageUuid, userId: input.userId },
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
            if (userEssay.overallReviewStatus === UserEssayConstants.STATUS.FAILED) {
                const updatedItem = await UserEssayRepository.update(
                    { overallReviewStatus: UserEssayConstants.STATUS.PENDING },
                    { id: userEssay.id },
                    trx
                );

                if (!updatedItem) throw new EssayReviewError(language.USER_ESSAY.UPDATE_FAILED);

                shouldAddJob = true;
            }

            const pendingItems = userEssay.essayItems.filter((item) => item.reviewStatus === UserEssayConstants.STATUS.PENDING);
            if (pendingItems.length) {
                const pendingItemIds = pendingItems.map((item) => item.id);
                const updatedItem = await UserEssayItemRepository.update(
                    { reviewStatus: UserEssayConstants.STATUS.PENDING },
                    { id: pendingItemIds },
                    trx
                );

                if (!updatedItem) throw new EssayReviewError(language.USER_ESSAY_ITEM.UPDATE_FAILED);

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
