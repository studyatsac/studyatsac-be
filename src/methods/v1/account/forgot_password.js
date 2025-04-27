const ForgotPasswordValidation = require("../../../validations/v1/account/forgot_password");
const AccountService = require("../../../services/v1/account");
const Language = require("../../../languages");
const LogUtils = require("../../../utils/logger");

let lang;

exports.postForgotPassword = async (req, res) => {
  try {
    const { body } = req;
    console.log("Request body:", body);

    lang = Language.getLanguage(req.locale);

    let input;

    try {
      input = await ForgotPasswordValidation(lang).validateAsync(body);
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }

    const result = await AccountService.forgotPassword(input, { lang });

    if (!result.status) {
      return res.status(result.code).json({ message: result.message });
    }

    return res.status(200).json({
      message: result.message,
    });
  } catch (err) {
    LogUtils.loggingError({
      functionName: "postForgotPassword",
      message: err.message,
      error: err,
    });

    return res.status(500).json({ message: lang.INTERNAL_SERVER_ERROR });
  }
};

module.exports = exports;
