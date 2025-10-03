const { getAllCertificatesByUserId } = require('../../../services/v1/certificate');
const Language = require('../../../languages');

exports.getAllCertificatesByUserId = async (req, res) => {
    try {
        const { userid } = req.params;

        const lang = Language.getLanguage(req.locale);

        if (!userid) {
            return res.status(400).json({ message: 'User ID is required.' });
        }

        const result = await getAllCertificatesByUserId(userid, { lang });

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
