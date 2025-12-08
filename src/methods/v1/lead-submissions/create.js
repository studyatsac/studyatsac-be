const LeadSubmissionsService = require('../../../services/v1/lead-submissions');
const Language = require('../../../languages');
const LogUtils = require('../../../utils/logger');
const LeadSubmissionsValidation = require('../../../validations/v1/lead-submissions/create');

let lang;

exports.createLeadSubmission = async (req, res) => {
    try {
        lang = Language.getLanguage(req.locale);

        let input;
        try {
            input = await LeadSubmissionsValidation(lang).validateAsync(req.body);
        } catch (err) {
            return res.status(400).json({ message: err.message });
        }

        const result = await LeadSubmissionsService.createLeadSubmission(input, { lang });

        if (!result.status) {
            return res.status(result.code).json({ message: result.message });
        }

        return res.status(201).json({
            data: result.data,
            message: lang.LEAD_SUBMISSIONS?.CREATE_SUCCESS || 'Lead submission created successfully'
        });
    } catch (err) {
        LogUtils.logError({
            functionName: 'createLeadSubmission',
            message: err.message
        });

        return res.status(500).json({ message: lang.INTERNAL_SERVER_ERROR });
    }
};

module.exports = exports;
