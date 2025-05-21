const IeltsWritingSubmissionRepository = require('../../../repositories/mysql/ielts_writing_submission');
const Models = require('../../../models/mysql');
const { Op } = require('sequelize');

exports.getListIeltsWritingSubmission = async (req, res) => {
    try {
        const { page = 1, limit = 10, search } = req.query;
        const pageInt = parseInt(page, 10) || 1;
        const limitInt = parseInt(limit, 10) || 10;
        const offset = (pageInt - 1) * limitInt;

        // Buat where clause untuk search
        const whereClause = {};
        if (search) {
            whereClause[Op.or] = [
                { '$User.full_name$': { [Op.like]: `%${search}%` } },
                { '$User.email$': { [Op.like]: `%${search}%` } }
            ];
        }

        // Ambil orderBy dan order langsung dari req.query tanpa validasi
        const orderBy = req.query.orderBy || 'created_at';
        const order = req.query.order || 'desc';

        const optionsClause = {
            where: whereClause,
            order: [[orderBy, order]],
            limit: limitInt,
            offset: offset,
            include: [{
                model: Models.User,
                attributes: ['id', 'full_name', 'email', 'institution_name', 'faculty', 'nip']
            }]
        };
        const submissions = await IeltsWritingSubmissionRepository.findAndCountAll(whereClause, optionsClause);
        return res.status(200).json({
            data: submissions.rows,
            meta: {
                page: pageInt,
                limit: limitInt,
                total_data: submissions.count,
                total_page: Math.ceil(submissions.count / limitInt)
            }
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = exports;
