const EssayService = require('../../../services/v1/essay');
const EssayTransformer = require('../../../transformers/v1/essay/essay');
const Language = require('../../../languages');
const LogUtils = require('../../../utils/logger');
const EssayValidation = require('../../../validations/v1/essay/essay');

let lang;

exports.updateEssay = async (req, res) => {
    try {
        lang = Language.getLanguage(req.locale);

        let input;
        try {
            input = await EssayValidation(lang).validateAsync(req.body);
        } catch (err) {
            return res.status(400).json({ message: err.message });
        }

        input.uuid = req.params.uuid;

        const result = await EssayService.updateEssay(input, { lang });

        if (!result.status) {
            return res.status(result.code).json({ message: result.message });
        }

        return res.status(200).json({ data: EssayTransformer.essayItem(result.data, false), message: lang.ESSAY.UPDATE_SUCCESS });
    } catch (err) {
        LogUtils.loggingError({
            functionName: 'updateEssay',
            message: err.message
        });

        return res.status(500).json({ message: lang.INTERNAL_SERVER_ERROR });
    }
};

module.exports = exports;
