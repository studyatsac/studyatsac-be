const SubmitAnswerValidation = require('../../../validations/v1/exam/submit_answer');
const ExamService = require('../../../services/v1/exam');
const Language = require('../../../languages');
const LogUtils = require('../../../utils/logger');

let lang;

exports.postAnswer = async (req, res) => {
    try {
        const { params, body } = req;

        lang = Language.getLanguage(req.locale);

        let input;

        try {
            input = await SubmitAnswerValidation(lang).validateAsync({ ...body, ...params });
        } catch (err) {
            return res.status(400).json({ message: err.message });
        }

        input.user = req.session;

        const result = await ExamService.submitAnswer(input, { lang });

        if (!result.status) {
            return res.status(result.code).json({ message: result.message });
        }

        return res.status(200).json({
            data: result.data
        });
    } catch (err) {
        LogUtils.loggingError({
            functionName: 'postAnswer',
            message: err.message
        });

        return res.status(500).json({ message: lang.INTERNAL_SERVER_ERROR });
    }
};

module.exports = exports;
