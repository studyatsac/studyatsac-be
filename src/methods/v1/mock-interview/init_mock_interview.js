const UserInterviewService = require('../../../services/v1/user_interview');
const UserInterviewTransformer = require('../../../transformers/v1/user-interview/user_interview');
const Language = require('../../../languages');
const LogUtils = require('../../../utils/logger');
const StartMockInterviewValidation = require('../../../validations/v1/mock-interview/start_mock_interview');
const MockInterviewService = require('../../../services/v1/mock_interview');

let lang;

exports.initMockInterview = async (req, res) => {
    try {
        lang = Language.getLanguage(req.locale);

        let input;
        try {
            input = await StartMockInterviewValidation(lang).validateAsync(req.body);
        } catch (err) {
            return res.status(400).json({ message: err.message });
        }

        input.userId = req.session.id;
        if (!input.userId) {
            return res.status(404).json({ message: lang.USER_NOT_FOUND });
        }

        const interviewPackageResult = await MockInterviewService.getPaidMockInterviewPackage(input, { lang });
        if (!interviewPackageResult.status) {
            return res.status(interviewPackageResult.code).json({ message: interviewPackageResult.message });
        }
        const interviewPackage = interviewPackageResult.data;
        if ((interviewPackage.itemMaxAttempt ?? 0) <= (interviewPackage.currentAttempt ?? 0)) {
            return res.status(400).json({ message: lang.MOCK_INTERVIEW.EXCEED_MAX_ATTEMPT });
        }

        input.interviewPackageId = interviewPackage.id;

        const result = await UserInterviewService.createUserInterview(
            input,
            { lang, isRestricted: true, withMock: true }
        );

        if (!result.status) {
            return res.status(result.code).json({ message: result.message });
        }

        return res.status(200).json({
            data: UserInterviewTransformer.userInterviewItem(result.data),
            message: lang.USER_INTERVIEW.CREATE_SUCCESS
        });
    } catch (err) {
        LogUtils.loggingError({
            functionName: 'initMockInterview',
            message: err.message
        });

        return res.status(500).json({ message: lang.INTERNAL_SERVER_ERROR });
    }
};

module.exports = exports;
