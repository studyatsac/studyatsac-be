const ScholarshipService = require('../../../services/v1/scholarship');
const Language = require('../../../languages');

exports.getScholarshipListAdmin = async (req, res) => {
    let lang;
    try {
        lang = Language.getLanguage(req.locale);

        // Ambil parameter paginasi dari query string
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const input = { page, limit };

        const result = await ScholarshipService.getScholarshipListAdmin(input, { lang });

        if (!result.status) {
            return res.status(result.code).json({ message: result.message });
        }

        // Format respons dengan metadata paginasi
        const { rows, count } = result.data;
        return res.status(200).json({
            code: result.code,
            messages: result.message,
            data: rows,
            meta: {
                page,
                limit,
                total_data: count,
                total_page: Math.ceil(count / limit)
            }
        });
    } catch (err) {
        console.error('Error in getScholarshipListAdmin controller:', err);
        const errorMessage = (lang && lang.INTERNAL_SERVER_ERROR) ? lang.INTERNAL_SERVER_ERROR : 'Internal Server Error';
        return res.status(500).json({ message: errorMessage });
    }
};
