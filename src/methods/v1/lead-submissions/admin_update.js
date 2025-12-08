const LeadSubmissionsService = require('../../../services/v1/lead-submissions');
const Language = require('../../../languages');
const LogUtils = require('../../../utils/logger');
const LeadSubmissionsValidation = require('../../../validations/v1/lead-submissions/update');

let lang;

exports.updateLeadSubmission = async (req, res) => {
    try {
        lang = Language.getLanguage(req.locale);

        let input;
        try {
            input = await LeadSubmissionsValidation(lang).validateAsync(req.body);
        } catch (err) {
            return res.status(400).json({ message: err.message });
        }

        const { id } = req.params;

        const result = await LeadSubmissionsService.updateLeadSubmission(id, input, { lang });

        if (!result.status) {
            return res.status(result.code).json({ message: result.message });
        }

        return res.status(200).json({
            data: result.data,
            message: lang.LEAD_SUBMISSIONS?.UPDATE_SUCCESS || 'Lead submission updated successfully'
        });
    } catch (err) {
        LogUtils.logError({
            functionName: 'updateLeadSubmission',
            message: err.message
        });

        return res.status(500).json({ message: lang.INTERNAL_SERVER_ERROR });
    }
};

module.exports = exports;
