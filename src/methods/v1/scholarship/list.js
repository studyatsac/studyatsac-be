const ScholarshipService = require('../../../services/v1/scholarship');
const Language = require('../../../languages');

exports.getScholarshipListPublic = async (req, res) => {
    let lang;
    try {
        lang = Language.getLanguage(req.locale);

        // Ambil parameter paginasi dan filter dari query string
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const month = req.query.month ? parseInt(req.query.month) : null;
        const search = req.query.search || null;

        // Filter tambahan: type, country, level (dapat berupa array atau string tunggal)
        let type = null;
        if (req.query.type) {
            type = Array.isArray(req.query.type) ? req.query.type : [req.query.type];
        }

        let country = null;
        if (req.query.country) {
            country = Array.isArray(req.query.country) ? req.query.country : [req.query.country];
        }

        let level = null;
        if (req.query.level) {
            level = Array.isArray(req.query.level) ? req.query.level : [req.query.level];
        }

        const input = {
            page, limit, month, search, type, country, level
        };

        const result = await ScholarshipService.getScholarshipListPublic(input, { lang });

        if (!result.status) {
            return res.status(result.code).json({ message: result.message });
        }

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
        console.error('Error in getScholarshipListPublic controller:', err);
        const errorMessage = (lang && lang.INTERNAL_SERVER_ERROR) ? lang.INTERNAL_SERVER_ERROR : 'Internal Server Error';
        return res.status(500).json({ message: errorMessage });
    }
};
