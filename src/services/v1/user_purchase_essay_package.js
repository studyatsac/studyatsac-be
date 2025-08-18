const UserPurchaseService = require('./user_purchase');
const ProductPackageConstants = require('../../constants/product_package');

const getUserPurchaseEssayPackageList = async (input, opts = {}) => UserPurchaseService.getUserPurchaseProductPackageList(
    { ...input, type: ProductPackageConstants.TYPE.ESSAY },
    opts
);

const createUserPurchaseEssayPackage = async (input, opts = {}) => {
    const language = opts.lang;

    return UserPurchaseService.createUserPurchase(
        { ...input, productPackageUuid: input.essayPackageUuid },
        { ...opts, packageNotFoundMessage: language.ESSAY_PACKAGE.NOT_FOUND }
    );
};

const claimUserPurchaseEssayPackage = async (input, opts = {}) => {
    const language = opts.lang;

    return UserPurchaseService.claimUserPurchaseProductPackage(
        {
            ...input,
            type: ProductPackageConstants.TYPE.ESSAY,
            productPackageUuid: input.essayPackageUuid
        },
        {
            ...opts,
            packageNotFoundMessage: language.ESSAY_PACKAGE.NOT_FOUND,
            alreadyClaimedMessage: language.USER_PURCHASE.ESSAY_PACKAGE_ALREADY_CLAIMED,
            claimFailedMessage: language.USER_PURCHASE.ESSAY_PACKAGE_CLAIM_FAILED
        }
    );
};

exports.getUserPurchaseEssayPackageList = getUserPurchaseEssayPackageList;
exports.createUserPurchaseEssayPackage = createUserPurchaseEssayPackage;
exports.claimUserPurchaseEssayPackage = claimUserPurchaseEssayPackage;

module.exports = exports;
