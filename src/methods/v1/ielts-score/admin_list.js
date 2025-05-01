const IeltsScoreRepository = require('../../../repositories/mysql/ielts_score');

exports.getListIeltsScore = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const pageInt = parseInt(page, 10) || 1;
        const limitInt = parseInt(limit, 10) || 10;
        const offset = (pageInt - 1) * limitInt;
        const whereClause = {};
        const optionsClause = {
            order: [['created_at', 'desc']],
            limit: limitInt,
            offset: offset
        };
        const scores = await IeltsScoreRepository.findAndCountAll(whereClause, optionsClause);
        return res.status(200).json({
            data: scores.rows,
            meta: {
                page: pageInt,
                limit: limitInt,
                totalData: scores.count,
                totalPage: Math.ceil(scores.count / limitInt)
            }
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = exports;
