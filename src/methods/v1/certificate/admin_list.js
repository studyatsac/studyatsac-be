const { getListCertificates } = require('../../../services/v1/certificate');

exports.getListCertificates = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const result = await getListCertificates({
            page: parseInt(page),
            limit: parseInt(limit)
        });

        if (!result.status) {
            return res.status(result.code).json({ message: result.message });
        }

        return res.status(result.code).json({
            code: result.code,
            message: result.message,
            data: result.data.rows,
            meta: {
                page: parseInt(page),
                limit: parseInt(limit),
                total_data: result.data.count,
                total_page: Math.ceil(result.data.count / limit)
            }
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = exports;
