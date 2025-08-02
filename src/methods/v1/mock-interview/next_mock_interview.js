const UserInterviewTransformer = require('../../../transformers/v1/user-interview/user_interview');
const Language = require('../../../languages');
const LogUtils = require('../../../utils/logger');
const NextMockInterviewValidation = require('../../../validations/v1/mock-interview/next_mock_interview');
const MockInterviewService = require('../../../services/v1/mock_interview');

let lang;

exports.nextMockInterview = async (req, res) => {
    try {
        lang = Language.getLanguage(req.locale);

        let input;
        try {
            input = await NextMockInterviewValidation(lang).validateAsync(req.body);
        } catch (err) {
            return res.status(400).json({ message: err.message });
        }

        input.userId = req.session.id;
        if (!input.userId) {
            return res.status(404).json({ message: lang.USER_NOT_FOUND });
        }

        input.uuid = req.params.uuid;
        const result = await MockInterviewService.nextMockInterview(input, { lang });
        if (!result.status) {
            return res.status(result.code).json({ message: result.message });
        }

        return res.status(200).json({
            data: UserInterviewTransformer.userInterviewItem(result.data),
            message: lang.USER_ESSAY.UPDATE_SUCCESS
        });
    } catch (err) {
        LogUtils.logError({
            functionName: 'nextMockInterview',
            message: err.message
        });

        return res.status(500).json({ message: lang.INTERNAL_SERVER_ERROR });
    }
};

module.exports = exports;
