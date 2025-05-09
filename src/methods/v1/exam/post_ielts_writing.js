const SubmitIeltsValidation = require('../../../validations/v1/exam/submit_ielts_writing');
const ExamService = require('../../../services/v1/exam');
const Language = require('../../../languages');
const LogUtils = require('../../../utils/logger');

let lang;

exports.postIeltsWriting = async (req, res) => {
    try {
        const { params, body } = req;

        lang = Language.getLanguage(req.locale);

        let input;

        try {
            input = await SubmitIeltsValidation(lang).validateAsync({ ...body, ...params });
        } catch (err) {
            return res.status(400).json({ message: err.message });
        }

        input.user = req.session;

        const result = await ExamService.submitIeltsWriting(input, { lang });

        if (!result.status) {
            return res.status(result.code).json({ message: result.message });
        }

        return res.status(200).json({
            message: 'ok'
        });
    } catch (err) {
        LogUtils.loggingError({
            function_name: 'postIeltsWriting',
            message: err.message
        });

        return res.status(500).json({ message: lang.INTERNAL_SERVER_ERROR });
    }
};

module.exports = exports;
