const ListValidation = require('../../../validations/custom/list');
const EssayPackageService = require('../../../services/v1/essay_package');
const EssayPackageTransformer = require('../../../transformers/v1/essay-package/essay_package');
const Language = require('../../../languages');
const LogUtils = require('../../../utils/logger');

let lang;

exports.getEssayPackageList = async (req, res) => {
    try {
        lang = Language.getLanguage(req.locale);

        let params;
        try {
            params = await ListValidation(lang).validateAsync(req.query);
        } catch (err) {
            return res.status(400).json({ message: err.message });
        }

        const result = await EssayPackageService.getAllEssayPackageAndCount(null, { lang, params });

        if (!result.status) {
            return res.status(result.code).json({ message: result.message });
        }

        return res.status(200).json({
            data: EssayPackageTransformer.essayPackageList(result.data.rows),
            message: '',
            meta: {
                page: params.page,
                limit: params.limit,
                totalData: result.data.count,
                totalPage: Math.ceil(result.data.count / params.limit)
            }
        });
    } catch (err) {
        LogUtils.loggingError({
            functionName: 'getEssayPackageList',
            message: err.message
        });

        return res.status(500).json({ message: lang.INTERNAL_SERVER_ERROR });
    }
};

module.exports = exports;
