const UserEssayService = require('../../../services/v1/user_essay');
const UserEssayTransformer = require('../../../transformers/v1/user-essay/user_essay');
const UserEssayItemTransformer = require('../../../transformers/v1/user-essay/user_essay_item');
const Language = require('../../../languages');
const LogUtils = require('../../../utils/logger');
const UserEssayValidation = require('../../../validations/v1/user-essay/user_essay');

let lang;

exports.updateUserEssay = async (req, res) => {
    try {
        lang = Language.getLanguage(req.locale);

        let input;
        try {
            input = await UserEssayValidation(lang).validateAsync(req.body);
        } catch (err) {
            return res.status(400).json({ message: err.message });
        }

        input.uuid = req.params.uuid;

        let withReview = false;
        if (input && input.withReview) {
            withReview = input.withReview;
            delete input.withReview;
        }

        const result = await UserEssayService.updateUserEssay(input, { lang, withReview });

        if (!result.status) {
            return res.status(result.code).json({ message: result.message });
        }

        return res.status(200).json({
            data: {
                ...UserEssayTransformer.userEssayItem(result.data),
                essayItems: UserEssayItemTransformer.userEssayItemList(result.data.essayItems, false)
            },
            message: lang.USER_ESSAY.UPDATE_SUCCESS
        });
    } catch (err) {
        LogUtils.loggingError({
            functionName: 'updateUserEssay',
            message: err.message
        });

        return res.status(500).json({ message: lang.INTERNAL_SERVER_ERROR });
    }
};

module.exports = exports;
