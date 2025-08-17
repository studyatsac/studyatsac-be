const UserPurchaseInterviewPackageService = require('../../../services/v1/user_purchase_interview_package');
const ListValidation = require('../../../validations/custom/list');
const UserPurchaseInterviewPackageTransformer = require('../../../transformers/v1/user-purchase/user_purchase_interview_package');
const Language = require('../../../languages');
const LogUtils = require('../../../utils/logger');

let lang;

exports.getUserPurchaseInterviewPackageList = async (req, res) => {
    try {
        lang = Language.getLanguage(req.locale);

        let params;
        try {
            params = await ListValidation(lang).validateAsync(req.query);
        } catch (err) {
            return res.status(400).json({ message: err.message });
        }

        const result = await UserPurchaseInterviewPackageService.getUserPurchaseInterviewPackageList(null, { lang, params });

        if (!result.status) {
            return res.status(result.code).json({ message: result.message });
        }

        return res.status(200).json({
            data: UserPurchaseInterviewPackageTransformer.userPurchaseInterviewPackageList(result.data.rows, false),
            message: '',
            meta: {
                page: params.page,
                limit: params.limit,
                totalData: result.data.count,
                totalPage: Math.ceil(result.data.count / params.limit)
            }
        });
    } catch (err) {
        LogUtils.logError({
            function_name: 'getUserPurchaseInterviewPackageList',
            message: err.message
        });

        return res.status(500).json({ message: lang.INTERNAL_SERVER_ERROR });
    }
};

module.exports = exports;
