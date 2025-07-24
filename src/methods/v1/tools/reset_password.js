const ResetPasswordDefaultValidation = require('../../../validations/v1/tools/reset_password_default');
const AccountService = require('../../../services/v1/account');
const Language = require('../../../languages');
const LogUtils = require('../../../utils/logger');

let lang;

exports.postResetPassword = async (req, res) => {
    try {
        const { body } = req;

        lang = Language.getLanguage(req.locale);

        let input;

        try {
            input = await ResetPasswordDefaultValidation(lang).validateAsync(body);
        } catch (err) {
            return res.status(400).json({ message: err.message });
        }

        const result = await AccountService.resetPasswordToDefaultPassword(input, { lang });

        if (!result.status) {
            return res.status(result.code).json({ message: result.message });
        }

        return res.status(200).json({
            message: 'ok'
        });
    } catch (err) {
        LogUtils.logError({
            function_name: 'postResetPassword',
            message: err.message
        });

        return res.status(500).json({ message: lang.INTERNAL_SERVER_ERROR });
    }
};

module.exports = exports;
