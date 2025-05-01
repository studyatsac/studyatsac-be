const IeltsWritingSubmissionRepository = require('../../../repositories/mysql/ielts_writing_submission');

exports.getListIeltsWritingSubmission = async (req, res) => {
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
        const submissions = await IeltsWritingSubmissionRepository.findAndCountAll(whereClause, optionsClause);
        return res.status(200).json({
            data: submissions.rows,
            meta: {
                page: pageInt,
                limit: limitInt,
                totalData: submissions.count,
                totalPage: Math.ceil(submissions.count / limitInt)
            }
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = exports;
