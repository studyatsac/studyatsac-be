const UserPurchaseService = require('../../../services/v1/user_purchase');
const ListValidation = require('../../../validations/custom/list');
const UserPurchaseTransformer = require('../../../transformers/v1/user-purchase/user_purchase');
const Language = require('../../../languages');
const LogUtils = require('../../../utils/logger');

let lang;

exports.getUserPurchaseEssayPackageList = async (req, res) => {
    try {
        lang = Language.getLanguage(req.locale);

        let params;
        try {
            params = await ListValidation(lang).validateAsync(req.query);
        } catch (err) {
            return res.status(400).json({ message: err.message });
        }

        const result = await UserPurchaseService.getUserPurchaseEssayPackageList(null, { lang, params });

        if (!result.status) {
            return res.status(result.code).json({ message: result.message });
        }

        return res.status(200).json({
            data: UserPurchaseTransformer.userPurchaseList(result.data.rows, false),
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
            function_name: 'getUserPurchaseEssayPackageList',
            message: err.message
        });

        return res.status(500).json({ message: lang.INTERNAL_SERVER_ERROR });
    }
};

module.exports = exports;
