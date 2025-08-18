const LoginValidation = require('../../../validations/v1/account/login');
const AccountService = require('../../../services/v1/account');
const TokenTransformer = require('../../../transformers/v1/account/token');
const Language = require('../../../languages');
const LogUtils = require('../../../utils/logger');

let lang;

exports.postLogin = async (req, res) => {
    try {
        const { body } = req;

        lang = Language.getLanguage(req.locale);

        let input;

        try {
            input = await LoginValidation(lang).validateAsync(body);
        } catch (err) {
            return res.status(400).json({ message: err.message });
        }

        const result = await AccountService.login(input, { lang });

        if (!result.status) {
            return res.status(result.code).json({ message: result.message });
        }

        return res.status(200).json({
            data: TokenTransformer.item(result.data)
        });
    } catch (err) {
        LogUtils.logError({
            function_name: 'postLogin',
            message: err.message
        });

        return res.status(500).json({ message: lang.INTERNAL_SERVER_ERROR });
    }
};

module.exports = exports;
