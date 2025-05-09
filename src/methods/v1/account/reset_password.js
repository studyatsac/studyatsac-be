const ResetPasswordValidation = require('../../../validations/v1/account/reset-password');
const AccountService = require("../../../services/v1/account");
const Language = require("../../../languages");
const LogUtils = require("../../../utils/logger");

let lang;

exports.resetPassword = async (req, res) => {
  try {
    lang = Language.getLanguage(req.locale);
    
    // Debug log
    console.log('req.locale:', req.locale);
    console.log('LANG:', lang);
    const schema = ResetPasswordValidation(lang);
    const input = await schema.validateAsync(req.body);
    const result = await AccountService.resetPassword(input, { lang });

    if (!result.status) {
        return res.status(result.code).json({ message: result.message });
    }

    return res.status(200).json({ message: result.message });
  } catch (err) {
    if (err.isJoi) {
      return res.status(400).json({ message: err.message });
    }
    LogUtils.loggingError({
      function_name: 'resetPassword',
      message: err.message,
      error: err
    });
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = exports;