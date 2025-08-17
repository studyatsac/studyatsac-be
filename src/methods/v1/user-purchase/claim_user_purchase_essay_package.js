const UserPurchaseEssayPackageService = require('../../../services/v1/user_purchase_essay_package');
const Language = require('../../../languages');
const LogUtils = require('../../../utils/logger');
const UserPurchaseTransformer = require('../../../transformers/v1/user-purchase/user_purchase');
const UserPurchaseEssayPackageValidation = require('../../../validations/v1/user-purchase/user_purchase_essay_package');

let lang;

exports.claimUserPurchaseEssayPackage = async (req, res) => {
    try {
        lang = Language.getLanguage(req.locale);

        let input;
        try {
            input = await UserPurchaseEssayPackageValidation(lang).validateAsync(req.body);
        } catch (err) {
            return res.status(400).json({ message: err.message });
        }

        const userId = req.session.id;
        if (!userId) {
            return res.status(404).json({ message: lang.USER_NOT_FOUND });
        }

        input.userId = userId;

        const result = await UserPurchaseEssayPackageService.claimUserPurchaseEssayPackage(input, { lang });

        if (!result.status) {
            return res.status(result.code).json({ message: result.message });
        }

        return res.status(200).json({
            data: UserPurchaseTransformer.userPurchaseItem(result.data, false),
            message: lang.USER_PURCHASE.ESSAY_PACKAGE_CLAIM_SUCCESS
        });
    } catch (err) {
        LogUtils.logError({
            functionName: 'claimUserPurchaseEssayPackage',
            message: err.message
        });

        return res.status(500).json({ message: lang.INTERNAL_SERVER_ERROR });
    }
};

module.exports = exports;
