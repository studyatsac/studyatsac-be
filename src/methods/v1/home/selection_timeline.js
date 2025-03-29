const HomeService = require('../../../services/v1/home');
const SelectionTimeTransformer = require('../../../transformers/v1/home/selection_timeline');
const Language = require('../../../languages');
const LogUtils = require('../../../utils/logger');

let lang;

exports.getSelectionTimeline = async (req, res) => {
    try {
        lang = Language.getLanguage(req.locale);

        const result = await HomeService.getSelectionTimeline(null, { lang });

        if (!result.status) {
            return res.status(result.code).json({ message: result.message });
        }

        const data = result.data;

        return res.status(200).json({
            data: data.map(SelectionTimeTransformer.item)
        });
    } catch (err) {
        LogUtils.loggingError({
            functionName: 'getSelectionTimeline',
            message: err.message
        });

        return res.status(500).json({ message: lang.INTERNAL_SERVER_ERROR });
    }
};

module.exports = exports;
