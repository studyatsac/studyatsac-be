const ListValidation = require('../../../validations/custom/list');
const InterviewPackageService = require('../../../services/v1/interview_package');
const InterviewPackageTransformer = require('../../../transformers/v1/interview-package/interview_package');
const Language = require('../../../languages');
const LogUtils = require('../../../utils/logger');

let lang;

exports.getMyInterviewPackageList = async (req, res) => {
    try {
        lang = Language.getLanguage(req.locale);

        let params;
        try {
            params = await ListValidation(lang).validateAsync(req.query);
        } catch (err) {
            return res.status(400).json({ message: err.message });
        }

        const userId = req.session.id;

        const result = await InterviewPackageService.getAllMyInterviewPackageAndCount(
            { userId, isActive: true },
            { lang, params }
        );

        if (!result.status) {
            return res.status(result.code).json({ message: result.message });
        }

        return res.status(200).json({
            data: InterviewPackageTransformer.interviewPackageList(result.data.rows),
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
            functionName: 'getMyInterviewPackageList',
            message: err.message
        });

        return res.status(500).json({ message: lang.INTERNAL_SERVER_ERROR });
    }
};

module.exports = exports;
