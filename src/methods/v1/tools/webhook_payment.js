const WebhookPaymentService = require('../../../services/v1/webhook_payment');
const Language = require('../../../languages');
const LogUtils = require('../../../utils/logger');

let lang;

exports.postWebhookPayment = async (req, res) => {
    try {
        const { params, body } = req;

        lang = Language.getLanguage(req.locale);

        const input = { ...params, ...body };

        const result = await WebhookPaymentService.handleWebhookPayment(input, { lang });

        if (!result.status) {
            return res.status(result.code).json({ message: result.message });
        }

        return res.status(200).json({
            message: 'ok'
        });
    } catch (err) {
        LogUtils.logError({
            function_name: 'postWebhookPayment',
            message: err.message
        });

        return res.status(500).json({ message: lang.INTERNAL_SERVER_ERROR });
    }
};

module.exports = exports;
