const UserPurchaseInterviewPackageService = require('../../../services/v1/user_purchase_interview_package');
const Language = require('../../../languages');
const LogUtils = require('../../../utils/logger');
const UserPurchaseTransformer = require('../../../transformers/v1/user-purchase/user_purchase');
const UserPurchaseInterviewPackageValidation = require('../../../validations/v1/user-purchase/user_purchase_interview_package');

let lang;

exports.claimUserPurchaseInterviewPackage = async (req, res) => {
    try {
        lang = Language.getLanguage(req.locale);

        let input;
        try {
            input = await UserPurchaseInterviewPackageValidation(lang).validateAsync(req.body);
        } catch (err) {
            return res.status(400).json({ message: err.message });
        }

        const userId = req.session.id;
        if (!userId) {
            return res.status(404).json({ message: lang.USER_NOT_FOUND });
        }

        input.userId = userId;

        const result = await UserPurchaseInterviewPackageService.claimUserPurchaseInterviewPackage(input, { lang });

        if (!result.status) {
            return res.status(result.code).json({ message: result.message });
        }

        return res.status(200).json({
            data: UserPurchaseTransformer.userPurchaseItem(result.data, false),
            message: lang.USER_PURCHASE.INTERVIEW_PACKAGE_CLAIM_SUCCESS
        });
    } catch (err) {
        LogUtils.logError({
            functionName: 'claimUserPurchaseInterviewPackage',
            message: err.message
        });

        return res.status(500).json({ message: lang.INTERNAL_SERVER_ERROR });
    }
};

module.exports = exports;
