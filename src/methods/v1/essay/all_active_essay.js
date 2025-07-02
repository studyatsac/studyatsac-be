const EssayService = require('../../../services/v1/essay');
const EssayTransformer = require('../../../transformers/v1/essay/essay');
const Language = require('../../../languages');
const LogUtils = require('../../../utils/logger');

let lang;

exports.getAllActiveEssay = async (req, res) => {
    try {
        lang = Language.getLanguage(req.locale);

        const input = { user: req.session };

        const result = await EssayService.getAllActiveEssay(input, { lang });

        if (!result.status) {
            return res.status(result.code).json({ message: result.message });
        }

        return res.status(200).json({ data: EssayTransformer.list(result.data) });
    } catch (err) {
        LogUtils.loggingError({
            functionName: 'getAllActiveEssay',
            message: err.message
        });

        return res.status(500).json({ message: lang.INTERNAL_SERVER_ERROR });
    }
};

module.exports = exports;
