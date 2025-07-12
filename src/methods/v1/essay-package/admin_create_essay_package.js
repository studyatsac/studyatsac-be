const EssayPackageService = require('../../../services/v1/essay_package');
const EssayPackageTransformer = require('../../../transformers/v1/essay-package/essay_package');
const Language = require('../../../languages');
const LogUtils = require('../../../utils/logger');
const EssayPackageValidation = require('../../../validations/v1/essay-package/essay_package');

let lang;

exports.createEssayPackage = async (req, res) => {
    try {
        lang = Language.getLanguage(req.locale);

        let input;
        try {
            input = await EssayPackageValidation(lang).validateAsync(req.body);
        } catch (err) {
            return res.status(400).json({ message: err.message });
        }

        const result = await EssayPackageService.createEssayPackage(input, { lang });

        if (!result.status) {
            return res.status(result.code).json({ message: result.message });
        }

        return res.status(200).json({
            data: EssayPackageTransformer.essayPackageItem(result.data, false),
            message: lang.ESSAY_PACKAGE.CREATE_SUCCESS
        });
    } catch (err) {
        LogUtils.loggingError({
            functionName: 'createEssayPackage',
            message: err.message
        });

        return res.status(500).json({ message: lang.INTERNAL_SERVER_ERROR });
    }
};

module.exports = exports;
