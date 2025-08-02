const EssayPackageService = require('../../../services/v1/essay_package');
const Language = require('../../../languages');
const LogUtils = require('../../../utils/logger');

let lang;

exports.deleteEssayPackage = async (req, res) => {
    try {
        lang = Language.getLanguage(req.locale);

        const { uuid } = req.params;
        const result = await EssayPackageService.deleteEssayPackage({ uuid }, { lang });

        if (!result.status) {
            return res.status(result.code).json({ message: result.message });
        }

        return res.status(200).json({ message: lang.ESSAY_PACKAGE.DELETE_SUCCESS });
    } catch (err) {
        LogUtils.logError({
            functionName: 'deleteEssayPackage',
            message: err.message
        });

        return res.status(500).json({ message: lang.INTERNAL_SERVER_ERROR });
    }
};

module.exports = exports;
