const UpdatePasswordValidation = require('../../../validations/v1/account/update_password');
const AccountService = require('../../../services/v1/account');
const Language = require('../../../languages');
const LogUtils = require('../../../utils/logger');

let lang;

exports.updatePassword = async (req, res) => {
    try {
        const { body } = req;

        lang = Language.getLanguage(req.locale);

        let input;

        try {
            input = await UpdatePasswordValidation(lang).validateAsync(body);
        } catch (err) {
            return res.status(400).json({ message: err.message });
        }

        input.user = req.session;

        const result = await AccountService.updatePassword(input, { lang });

        if (!result.status) {
            return res.status(result.code).json({ message: result.message });
        }

        return res.status(200).json({
            message: 'ok'
        });
    } catch (err) {
        LogUtils.logError({
            function_name: 'updatePassword',
            message: err.message
        });

        return res.status(500).json({ message: lang.INTERNAL_SERVER_ERROR });
    }
};

module.exports = exports;
