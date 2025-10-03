const { deleteCertificate } = require('../../../services/v1/certificate');

exports.deleteCertificate = async (req, res) => {
    try {
        const { certificate_id } = req.params;

        if (!certificate_id) {
            return res.status(400).json({ message: 'Certificate ID is required.' });
        }

        const result = await deleteCertificate(certificate_id);

        if (!result.status) {
            return res.status(result.code).json({ message: result.message });
        }

        return res.status(result.code).json({
            code: result.code,
            message: result.message,
            data: null
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};
