const UserReviewsService = require("../../../services/v1/user_reviews");
const UserReviewsTransformer = require("../../../transformers/v1/user-reviews/user_reviews");
const Language = require("../../../languages");
const LogUtils = require("../../../utils/logger");

let lang;

exports.createUserReview = async (req, res) => {
  try {
    lang = Language.getLanguage(req.locale);

    const input = {
      rating: req.body.rating,
      comment: req.body.comment,
      user: req.session,
    };

    console.log("Input for createUserReview:", input);

    const result = await UserReviewsService.createUserReview(input, { lang });

    if (!result.status) {
      return res.status(result.code).json({ message: result.message });
    }

    return res.status(200).json({
      data: result.data,
      message: lang.USER_REVIEW.CREATE_SUCCESS,
    });
  } catch (err) {
    LogUtils.loggingError({
      function_name: "createUserReview",
      message: err.message,
    });

    return res.status(500).json({ message: lang.INTERNAL_SERVER_ERROR });
  }
};

module.exports = exports;
