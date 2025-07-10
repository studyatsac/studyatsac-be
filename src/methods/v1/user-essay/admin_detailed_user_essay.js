const UserEssayService = require('../../../services/v1/user_essay');
const UserEssayTransformer = require('../../../transformers/v1/user-essay/user_essay');
const Language = require('../../../languages');
const LogUtils = require('../../../utils/logger');

let lang;

exports.getDetailedUserEssay = async (req, res) => {
    try {
        lang = Language.getLanguage(req.locale);

        const result = await UserEssayService.getUserEssay(
            req.params,
            { lang, isDetailed: true }
        );

        if (!result.status) {
            return res.status(result.code).json({ message: result.message });
        }

        return res.status(200).json({
            data: UserEssayTransformer.userEssayItem(result.data),
            message: ''
        });
    } catch (err) {
        LogUtils.loggingError({
            functionName: 'getDetailedUserEssay',
            message: err.message
        });

        return res.status(500).json({ message: lang.INTERNAL_SERVER_ERROR });
    }
};

module.exports = exports;
