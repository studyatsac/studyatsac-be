const IeltsScoreRepository = require('../../../repositories/mysql/ielts_score');
const Models = require('../../../models/mysql');
const { Op } = require('sequelize');

exports.getListIeltsScore = async (req, res) => {
    try {
        const { page = 1, limit = 10, search } = req.query;
        const pageInt = parseInt(page, 10) || 1;
        const limitInt = parseInt(limit, 10) || 10;
        const offset = (pageInt - 1) * limitInt;

        // Ambil orderBy dan order langsung dari req.query tanpa validasi
        const orderBy = req.query.orderBy || 'created_at';
        const order = req.query.order || 'desc';

        // Buat where clause untuk search
        const where_clause = {};
        if (search) {
            where_clause[Op.or] = [
                { '$User.full_name$': { [Op.like]: `%${search}%` } },
                { '$User.email$': { [Op.like]: `%${search}%` } }
            ];
        }

        const options_clause = {
            where: where_clause,
            order: [[orderBy, order]],
            limit: limitInt,
            offset: offset,
            include: [{
                model: Models.User,
                attributes: ['id', 'full_name', 'email', 'institution_name', 'faculty', 'nip']
            }]
        };
        const scores = await IeltsScoreRepository.findAndCountAll(where_clause, options_clause);
        return res.status(200).json({
            data: scores.rows,
            meta: {
                page: pageInt,
                limit: limitInt,
                total_data: scores.count,
                total_page: Math.ceil(scores.count / limitInt)
            }
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = exports;
