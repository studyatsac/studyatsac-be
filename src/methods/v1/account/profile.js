const AccountService = require('../../../services/v1/account');
const Language = require('../../../languages');
const AccountProfileTransformer = require('../../../transformers/v1/account/profile');
const LogUtils = require('../../../utils/logger');

let lang;

exports.getAccountProfile = async (req, res) => {
    try {
        lang = Language.getLanguage(req.locale);

        const input = {
            user: req.session
        };

        const result = await AccountService.getProfileAccount(input, { lang });

        if (!result.status) {
            return res.status(result.code).json({ message: result.message });
        }

        return res.status(200).json({
            data: AccountProfileTransformer.item(result.data)
        });
    } catch (err) {
        LogUtils.loggingError({
            functionName: 'getAccountProfile',
            message: err.message
        });

        return res.status(500).json({ message: lang.INTERNAL_SERVER_ERROR });
    }
};

module.exports = exports;
