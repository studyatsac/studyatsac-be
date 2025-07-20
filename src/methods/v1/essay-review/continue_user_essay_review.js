const UserEssayTransformer = require('../../../transformers/v1/user-essay/user_essay');
const Language = require('../../../languages');
const LogUtils = require('../../../utils/logger');
const EssayReviewService = require('../../../services/v1/essay_review');
const ContinueEssayReviewValidation = require('../../../validations/v1/essay-review/continue_essay_review');

let lang;

exports.continueUserEssayReview = async (req, res) => {
    try {
        lang = Language.getLanguage(req.locale);

        const userId = req.session.id;
        if (!userId) {
            return res.status(404).json({ message: lang.USER_NOT_FOUND });
        }

        let input;
        try {
            input = await ContinueEssayReviewValidation(lang).validateAsync(req.body);
        } catch (err) {
            return res.status(400).json({ message: err.message });
        }

        input.uuid = req.params.uuid;
        const result = await EssayReviewService.continueEssayReview(input, { lang });
        if (!result.status) {
            return res.status(result.code).json({ message: result.message });
        }

        return res.status(200).json({
            data: UserEssayTransformer.userEssayItem(result.data),
            message: lang.USER_ESSAY.UPDATE_SUCCESS
        });
    } catch (err) {
        LogUtils.loggingError({
            functionName: 'continueUserEssayReview',
            message: err.message
        });

        return res.status(500).json({ message: lang.INTERNAL_SERVER_ERROR });
    }
};

module.exports = exports;
