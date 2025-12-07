const LeadSubmissionsService = require('../../../services/v1/lead-submissions');
const Language = require('../../../languages');
const LogUtils = require('../../../utils/logger');

let lang;

exports.deleteLeadSubmission = async (req, res) => {
    try {
        lang = Language.getLanguage(req.locale);

        const { id } = req.params;

        const result = await LeadSubmissionsService.deleteLeadSubmission(id, { lang });

        if (!result.status) {
            return res.status(result.code).json({ message: result.message });
        }

        return res.status(200).json({
            message: lang.LEAD_SUBMISSIONS.DELETE_SUCCESS || 'Lead submission deleted successfully'
        });
    } catch (err) {
        LogUtils.logError({
            functionName: 'deleteLeadSubmission',
            message: err.message
        });

        return res.status(500).json({ message: lang.INTERNAL_SERVER_ERROR });
    }
};

module.exports = exports;
