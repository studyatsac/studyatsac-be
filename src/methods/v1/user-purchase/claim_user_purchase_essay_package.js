const EssayPackageService = require('../../../services/v1/essay_package');
const UserPurchaseService = require('../../../services/v1/user_purchase');
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

        const essayPackage = await EssayPackageService.getEssayPackage(
            { uuid: input.essayPackageUuid, price: 0 },
            { lang }
        );

        if (!essayPackage.status) {
            return res.status(essayPackage.code).json({ message: essayPackage.message });
        }
        if (!essayPackage.data) {
            return res.status(404).json({ message: lang.ESSAY_PACKAGE.NOT_FOUND });
        }

        const userId = req.session.id;
        if (!userId) {
            return res.status(404).json({ message: lang.USER_NOT_FOUND });
        }

        const result = await UserPurchaseService.claimUserPurchaseEssayPackage(
            { userId, essayPackageId: essayPackage.data.id },
            { lang }
        );

        if (!result.status) {
            return res.status(result.code).json({ message: result.message });
        }

        return res.status(200).json({
            data: UserPurchaseTransformer.userPurchaseItem(result.data, false),
            message: lang.USER_PURCHASE.ESSAY_PACKAGE_CLAIM_SUCCESS
        });
    } catch (err) {
        LogUtils.loggingError({
            functionName: 'claimUserPurchaseEssayPackage',
            message: err.message
        });

        return res.status(500).json({ message: lang.INTERNAL_SERVER_ERROR });
    }
};

module.exports = exports;
