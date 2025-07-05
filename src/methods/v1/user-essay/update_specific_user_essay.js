const UserEssayService = require('../../../services/v1/user_essay');
const UserEssayTransformer = require('../../../transformers/v1/user-essay/user_essay');
const UserEssayItemTransformer = require('../../../transformers/v1/user-essay/user_essay_item');
const Language = require('../../../languages');
const LogUtils = require('../../../utils/logger');
const UserEssayValidation = require('../../../validations/v1/user-essay/user_essay');

let lang;

exports.updateSpecificUserEssay = async (req, res) => {
    try {
        lang = Language.getLanguage(req.locale);

        let input;
        try {
            input = await UserEssayValidation(lang).validateAsync(req.body);
        } catch (err) {
            return res.status(400).json({ message: err.message });
        }

        input.userId = req.session.id;
        if (!input.userId) {
            return res.status(404).json({ message: lang.USER_NOT_FOUND });
        }

        input.uuid = req.params.uuid;

        const result = await UserEssayService.updateUserEssay(input, { lang }, true);

        if (!result.status) {
            return res.status(result.code).json({ message: result.message });
        }

        return res.status(200).json({
            data: {
                ...UserEssayTransformer.userEssayItem(result.data),
                essayItems: UserEssayItemTransformer.userEssayItemList(result.data.essayItems)
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
