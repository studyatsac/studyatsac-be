const UserInterviewService = require('../../../services/v1/user_interview');
const UserInterviewTransformer = require('../../../transformers/v1/user-interview/user_interview');
const Language = require('../../../languages');
const LogUtils = require('../../../utils/logger');
const UserInterviewValidation = require('../../../validations/v1/user-interview/user_interview');

let lang;

exports.updateUserInterview = async (req, res) => {
    try {
        lang = Language.getLanguage(req.locale);

        let input;
        try {
            input = await UserInterviewValidation(lang).validateAsync(req.body);
        } catch (err) {
            return res.status(400).json({ message: err.message });
        }

        input.uuid = req.params.uuid;

        let withReview = false;
        if (input && input.withReview) {
            withReview = input.withReview;
            delete input.withReview;
        }

        const result = await UserInterviewService.updateUserInterview(input, { lang, withReview });

        if (!result.status) {
            return res.status(result.code).json({ message: result.message });
        }

        return res.status(200).json({
            data: UserInterviewTransformer.userInterviewItem(result.data, false),
            message: lang.USER_INTERVIEW.UPDATE_SUCCESS
        });
    } catch (err) {
        LogUtils.logError({
            functionName: 'updateUserInterview',
            message: err.message
        });

        return res.status(500).json({ message: lang.INTERNAL_SERVER_ERROR });
    }
};

module.exports = exports;
