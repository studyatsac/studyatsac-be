const UserPurchaseEssayPackageService = require('../../../services/v1/user_purchase_essay_package');
const UserPurchaseEssayPackageTransformer = require('../../../transformers/v1/user-purchase/user_purchase_essay_package');
const UserPurchaseValidation = require('../../../validations/v1/user-purchase/user_purchase');
const Language = require('../../../languages');
const LogUtils = require('../../../utils/logger');

let lang;

exports.createUserPurchaseEssayPackage = async (req, res) => {
    try {
        lang = Language.getLanguage(req.locale);

        let input;
        try {
            input = await UserPurchaseValidation(lang).validateAsync(req.body);
        } catch (err) {
            return res.status(400).json({ message: err.message });
        }

        const result = await UserPurchaseEssayPackageService.createUserPurchaseEssayPackage(input, { lang });

        if (!result.status) {
            return res.status(result.code).json({ message: result.message });
        }

        return res.status(200).json({
            data: UserPurchaseEssayPackageTransformer.userPurchaseEssayPackageItem(result.data, false),
            message: lang.USER_PURCHASE.CREATE_SUCCESS
        });
    } catch (err) {
        LogUtils.loggingError({
            function_name: 'createUserPurchaseEssayPackage',
            message: err.message
        });

        return res.status(500).json({ message: lang.INTERNAL_SERVER_ERROR });
    }
};

module.exports = exports;
