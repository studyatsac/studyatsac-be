const UserEssayService = require('../../../services/v1/user_essay');
const Language = require('../../../languages');
const LogUtils = require('../../../utils/logger');

let lang;

exports.deleteUserEssay = async (req, res) => {
    try {
        lang = Language.getLanguage(req.locale);

        const result = await UserEssayService.deleteUserEssay(req.params, { lang });

        if (!result.status) {
            return res.status(result.code).json({ message: result.message });
        }

        return res.status(200).json({ message: lang.USER_ESSAY.DELETE_SUCCESS });
    } catch (err) {
        LogUtils.loggingError({
            functionName: 'deleteUserEssay',
            message: err.message
        });

        return res.status(500).json({ message: lang.INTERNAL_SERVER_ERROR });
    }
};

module.exports = exports;
