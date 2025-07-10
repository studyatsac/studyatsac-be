const EssayPackageService = require('../../../services/v1/essay_package');
const EssayPackageTransformer = require('../../../transformers/v1/essay-package/essay_package');
const Language = require('../../../languages');
const LogUtils = require('../../../utils/logger');

let lang;

exports.getActiveEssayPackageList = async (req, res) => {
    try {
        lang = Language.getLanguage(req.locale);

        const result = await EssayPackageService.getAllEssayPackage({ isActive: true }, { lang });

        if (!result.status) {
            return res.status(result.code).json({ message: result.message });
        }

        return res.status(200).json({ data: EssayPackageTransformer.essayPackageList(result.data), message: '' });
    } catch (err) {
        LogUtils.loggingError({
            functionName: 'getActiveEssayPackageList',
            message: err.message
        });

        return res.status(500).json({ message: lang.INTERNAL_SERVER_ERROR });
    }
};

module.exports = exports;
