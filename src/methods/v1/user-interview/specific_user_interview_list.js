const UserInterviewListValidation = require('../../../validations/v1/user-interview/user_interview_list');
const UserInterviewService = require('../../../services/v1/user_interview');
const UserInterviewTransformer = require('../../../transformers/v1/user-interview/user_interview');
const Language = require('../../../languages');
const LogUtils = require('../../../utils/logger');

let lang;

exports.getSpecificUserInterviewList = async (req, res) => {
    try {
        lang = Language.getLanguage(req.locale);

        let params;
        try {
            params = await UserInterviewListValidation(lang).validateAsync(req.query);
        } catch (err) {
            return res.status(400).json({ message: err.message });
        }

        const input = { userId: req.session.id };
        if (!input.userId) {
            return res.status(404).json({ message: lang.USER_NOT_FOUND });
        }

        if (params.interviewUuid) {
            input.interviewUuid = params.interviewUuid;
        }

        const result = await UserInterviewService.getAllUserInterviewAndCount(input, { lang, params });

        if (!result.status) {
            return res.status(result.code).json({ message: result.message });
        }

        return res.status(200).json({
            data: UserInterviewTransformer.userInterviewList(result.data.rows),
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
            functionName: 'getUserInterviewList',
            message: err.message
        });

        return res.status(500).json({ message: lang.INTERNAL_SERVER_ERROR });
    }
};

module.exports = exports;
