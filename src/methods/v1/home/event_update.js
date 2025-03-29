const HomeService = require('../../../services/v1/home');
const EventUpdateTransformer = require('../../../transformers/v1/home/event_update');
const Language = require('../../../languages');
const LogUtils = require('../../../utils/logger');

let lang;

exports.getEventUpdate = async (req, res) => {
    try {
        lang = Language.getLanguage(req.locale);

        const result = await HomeService.getEventUpdate(null, { lang });

        if (!result.status) {
            return res.status(result.code).json({ message: result.message });
        }

        const data = result.data;

        return res.status(200).json({
            data: data.map(EventUpdateTransformer.item)
        });
    } catch (err) {
        LogUtils.loggingError({
            functionName: 'getEventUpdate',
            message: err.message
        });

        return res.status(500).json({ message: lang.INTERNAL_SERVER_ERROR });
    }
};

module.exports = exports;
