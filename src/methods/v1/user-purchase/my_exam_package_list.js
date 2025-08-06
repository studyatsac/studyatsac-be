const UserPurchaseService = require("../../../services/v1/user_purchase");
const MyExamPackageTransformer = require("../../../transformers/v1/user-purchase/my_exam_package_list");
const Language = require("../../../languages");
const LogUtils = require("../../../utils/logger");

let lang;

exports.getMyExamPackage = async (req, res) => {
  try {
    const { query } = req;

    lang = Language.getLanguage(req.locale);

    const input = {
      ...query,
      user: req.session,
    };

    console.log("[DEBUG] input.user:", input.user);

    const result = await UserPurchaseService.getMyExamPackage(input, { lang });

    console.log("[DEBUG] result:", result);

    if (!result.status) {
      return res.status(result.code).json({ message: result.message });
    }

    const data = result.data || {};
    const rows = data.rows || [];

    console.log("[DEBUG] Mapped Data:", rows.map(MyExamPackageTransformer.item));

    console.log("[DEBUG] result.data.rows:", rows);

    console.log("[DEBUG] row:", JSON.stringify(data, null, 2));

    console.log("[DEBUG] one row:", JSON.stringify(rows[0], null, 2));

    return res.status(200).json({
      data: rows.map(MyExamPackageTransformer.item),
    });
  } catch (err) {
    LogUtils.loggingError({
      function_name: "getMyExamPackage",
      message: err.message,
    });

    return res.status(500).json({ message: lang.INTERNAL_SERVER_ERROR });
  }
};

module.exports = exports;
