const EssayPackageService = require('../../../services/v1/essay_package');
const EssayPackageTransformer = require('../../../transformers/v1/essay-package/essay_package');
const Language = require('../../../languages');
const LogUtils = require('../../../utils/logger');

let lang;

exports.getEssayPackage = async (req, res) => {
    try {
        lang = Language.getLanguage(req.locale);

        const { uuid } = req.params;
        const result = await EssayPackageService.getEssayPackage({ uuid }, { lang });

        if (!result.status) {
            return res.status(result.code).json({ message: result.message });
        }

        return res.status(200).json({ data: EssayPackageTransformer.essayPackageItem(result.data, false), message: '' });
    } catch (err) {
        LogUtils.loggingError({
            functionName: 'getEssayPackage',
            message: err.message
        });

        return res.status(500).json({ message: lang.INTERNAL_SERVER_ERROR });
    }
};

module.exports = exports;
