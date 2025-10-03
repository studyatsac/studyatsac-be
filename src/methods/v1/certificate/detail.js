
const Language = require('../../../languages');
const { getDetailCertificateById } = require('../../../services/v1/certificate');

exports.getDetailCertificateById = async (req, res) => {
    try {
        const { certificate_id } = req.params;

        const lang = Language.getLanguage(req.locale);

        if (!certificate_id) {
            return res.status(400).json({ message: 'Certificate ID is required.' });
        }

        const result = await getDetailCertificateById(certificate_id, { lang });

        if (!result.status) {
            return res.status(result.code).json({ message: result.message });
        }

        return res.status(result.code).json({
            code: result.code,
            message: result.message,
            data: result.data
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = exports;
