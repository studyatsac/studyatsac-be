const UserEssayService = require('../../../services/v1/user_essay');
const UserEssayTransformer = require('../../../transformers/v1/user-essay/user_essay');
const Language = require('../../../languages');
const LogUtils = require('../../../utils/logger');
const UserEssayItemTransformer = require('../../../transformers/v1/user-essay/user_essay_item');

let lang;

exports.getUserEssay = async (req, res) => {
    try {
        lang = Language.getLanguage(req.locale);

        const result = await UserEssayService.getUserEssay(req.params, { lang });

        if (!result.status) {
            return res.status(result.code).json({ message: result.message });
        }

        return res.status(200).json({
            data: {
                ...UserEssayTransformer.userEssayItem(result.data),
                essayItems: UserEssayItemTransformer.userEssayItemList(result.data.essayItems)
            },
            message: ''
        });
    } catch (err) {
        LogUtils.loggingError({
            functionName: 'getUserEssay',
            message: err.message
        });

        return res.status(500).json({ message: lang.INTERNAL_SERVER_ERROR });
    }
};

module.exports = exports;
