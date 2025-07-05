const UserEssayService = require('../../../services/v1/user_essay');
const UserEssayTransformer = require('../../../transformers/v1/user-essay/user_essay');
const UserEssayItemTransformer = require('../../../transformers/v1/user-essay/user_essay_item');
const Language = require('../../../languages');
const LogUtils = require('../../../utils/logger');
const UserEssayValidation = require('../../../validations/v1/user-essay/user_essay');

let lang;

exports.createUserEssay = async (req, res) => {
    try {
        lang = Language.getLanguage(req.locale);

        let input;
        try {
            input = await UserEssayValidation(lang).validateAsync(req.body);
        } catch (err) {
            return res.status(400).json({ message: err.message });
        }

        const result = await UserEssayService.createUserEssay(input, { lang });

        if (!result.status) {
            return res.status(result.code).json({ message: result.message });
        }

        return res.status(200).json({
            data: {
                ...UserEssayTransformer.essayItem(result.data),
                essayItems: UserEssayItemTransformer.essayItemList(result.data.essayItems)
            },
            message: lang.ESSAY.CREATE_SUCCESS
        });
    } catch (err) {
        LogUtils.loggingError({
            functionName: 'createUserEssay',
            message: err.message
        });

        return res.status(500).json({ message: lang.INTERNAL_SERVER_ERROR });
    }
};

module.exports = exports;
