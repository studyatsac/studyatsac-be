const EssayService = require('../../../services/v1/essay');
const Language = require('../../../languages');
const LogUtils = require('../../../utils/logger');

let lang;

exports.deleteEssay = async (req, res) => {
    try {
        lang = Language.getLanguage(req.locale);

        const { id } = req.params;

        const result = await EssayService.deleteEssay(id, { lang });

        if (!result.status) {
            return res.status(result.code).json({ message: result.message });
        }

        return res.status(200).json({ message: lang.ESSAY.DELETE_SUCCESS });
    } catch (err) {
        LogUtils.loggingError({
            functionName: 'deleteEssay',
            message: err.message
        });

        return res.status(500).json({ message: lang.INTERNAL_SERVER_ERROR });
    }
};

module.exports = exports;
