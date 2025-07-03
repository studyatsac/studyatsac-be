const EssayService = require('../../../services/v1/essay');
const EssayTransformer = require('../../../transformers/v1/essay/essay');
const Language = require('../../../languages');
const LogUtils = require('../../../utils/logger');
const EssayItemTransformer = require('../../../transformers/v1/essay/essay_item');

let lang;

exports.getEssay = async (req, res) => {
    try {
        lang = Language.getLanguage(req.locale);

        const result = await EssayService.getEssay(req.params, { lang });

        if (!result.status) {
            return res.status(result.code).json({ message: result.message });
        }

        return res.status(200).json({
            data: {
                ...EssayTransformer.essayItem(result.data),
                essayItems: EssayItemTransformer.essayItemList(result.data.essayItems)
            },
            message: ''
        });
    } catch (err) {
        LogUtils.loggingError({
            functionName: 'getEssay',
            message: err.message
        });

        return res.status(500).json({ message: lang.INTERNAL_SERVER_ERROR });
    }
};

module.exports = exports;
