const UserPurchaseValidation = require('../../../validations/v1/tools/user_purchase');
const UserPurchaseService = require('../../../services/v1/user_purchase');
const UserPurchaseTransformer = require('../../../transformers/v1/tools/user_purchase');
const Language = require('../../../languages');
const LogUtils = require('../../../utils/logger');

let lang;

exports.postUserPurchase = async (req, res) => {
    try {
        const { body } = req;

        lang = Language.getLanguage(req.locale);

        let input;

        try {
            input = await UserPurchaseValidation(lang).validateAsync(body);
        } catch (err) {
            return res.status(400).json({ message: err.message });
        }

        const result = await UserPurchaseService.injectUserPurchase(input, { lang });

        if (!result.status) {
            return res.status(result.code).json({ message: result.message });
        }

        return res.status(200).json({
            data: UserPurchaseTransformer.item(result.data)
        });
    } catch (err) {
        LogUtils.loggingError({
            function_name: 'postUserPurchase',
            message: err.message
        });

        return res.status(500).json({ message: lang.INTERNAL_SERVER_ERROR });
    }
};

module.exports = exports;
