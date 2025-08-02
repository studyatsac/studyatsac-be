const UserPurchaseService = require('../../../services/v1/user_purchase');
const Language = require('../../../languages');
const LogUtils = require('../../../utils/logger');

let lang;

exports.deleteUserPurchaseInterviewPackage = async (req, res) => {
    try {
        lang = Language.getLanguage(req.locale);

        const { uuid } = req.params;
        // TODO: Specify the product type
        const result = await UserPurchaseService.deleteUserPurchase({ uuid }, { lang });

        if (!result.status) {
            return res.status(result.code).json({ message: result.message });
        }

        return res.status(200).json({ message: lang.USER_PURCHASE.DELETE_SUCCESS });
    } catch (err) {
        LogUtils.logError({
            function_name: 'deleteUserPurchaseInterviewPackage',
            message: err.message
        });

        return res.status(500).json({ message: lang.INTERNAL_SERVER_ERROR });
    }
};

module.exports = exports;
