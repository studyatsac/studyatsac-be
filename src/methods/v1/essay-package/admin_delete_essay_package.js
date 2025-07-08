const EssayPackageService = require('../../../services/v1/essay_package');
const Language = require('../../../languages');
const LogUtils = require('../../../utils/logger');

let lang;

exports.deleteEssayPackage = async (req, res) => {
    try {
        lang = Language.getLanguage(req.locale);

        const result = await EssayPackageService.deleteEssayPackage(req.params, { lang });

        if (!result.status) {
            return res.status(result.code).json({ message: result.message });
        }

        return res.status(200).json({ message: lang.ESSAY_PACKAGE.DELETE_SUCCESS });
    } catch (err) {
        LogUtils.loggingError({
            functionName: 'deleteEssayPackage',
            message: err.message
        });

        return res.status(500).json({ message: lang.INTERNAL_SERVER_ERROR });
    }
};

module.exports = exports;
