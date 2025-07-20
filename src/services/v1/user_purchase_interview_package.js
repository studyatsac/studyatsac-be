const UserPurchaseService = require('./user_purchase');
const ProductPackageConstants = require('../../constants/product_package');

const getUserPurchaseInterviewPackageList = async (input, opts = {}) => UserPurchaseService.getUserPurchaseProductPackageList(
    { ...input, type: ProductPackageConstants.TYPE.INTERVIEW },
    opts
);

const createUserPurchaseInterviewPackage = async (input, opts = {}) => {
    const language = opts.lang;

    return UserPurchaseService.createUserPurchase(
        { ...input, productPackageUuid: input.essayPackageUuid },
        { ...opts, packageNotFoundMessage: language.INTERVIEW_PACKAGE.NOT_FOUND }
    );
};

const claimUserPurchaseInterviewPackage = async (input, opts = {}) => {
    const language = opts.lang;

    return UserPurchaseService.claimUserPurchaseProductPackage(
        {
            ...input,
            type: ProductPackageConstants.TYPE.INTERVIEW,
            productPackageUuid: input.essayPackageUuid
        },
        {
            ...opts,
            packageNotFoundMessage: language.INTERVIEW_PACKAGE.NOT_FOUND,
            alreadyClaimedMessage: language.USER_PURCHASE.INTERVIEW_PACKAGE_ALREADY_CLAIMED,
            claimFailedMessage: language.USER_PURCHASE.INTERVIEW_PACKAGE_CLAIM_FAILED
        }
    );
};

exports.getUserPurchaseInterviewPackageList = getUserPurchaseInterviewPackageList;
exports.createUserPurchaseInterviewPackage = createUserPurchaseInterviewPackage;
exports.claimUserPurchaseInterviewPackage = claimUserPurchaseInterviewPackage;

module.exports = exports;
