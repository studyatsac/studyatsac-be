const { Op } = require('sequelize');
const QuestionRepository = require('../../../repositories/mysql/question');
const Models = require('../../../models/mysql');
const LogUtils = require('../../../utils/logger');

exports.getListQuestion = async (req, res) => {
    try {
        const { page = 1, limit = 10, search } = req.query;
        const pageInt = parseInt(page, 10) || 1;
        const limitInt = parseInt(limit, 10) || 10;
        const offset = (pageInt - 1) * limitInt;

        // Ambil orderBy dan order langsung dari req.query tanpa validasi
        const orderBy = req.query.orderBy || 'created_at';
        const order = req.query.order || 'desc';

        // Buat where clause untuk search
        const whereClause = {};
        if (search) {
            whereClause[Op.or] = [
                { '$Question.question$': { [Op.like]: `%${search}%` } },
                { '$Exam.title$': { [Op.like]: `%${search}%` } }
            ];
        }

        const optionsClause = {
            where: whereClause,
            order: [[orderBy, order]],
            limit: limitInt,
            offset,
            include: [
                {
                    model: Models.Exam,
                    as: 'exam',
                    attributes: ['id', 'title', 'number_of_question', 'duration', 'description', 'category_id', 'grade_rules', 'additional_information']
                },
                {
                    model: Models.Resources,
                    as: 'resource',
                    attributes: ['id', 'resource_name', 'type', 'source_link']
                },
                {
                    model: Models.Section,
                    as: 'section',
                    attributes: ['id', 'section_type', 'created_at', 'updated_at']
                }
            ]
        };

        const question = await QuestionRepository.findAndCountAll(whereClause, optionsClause);
        const data = { rows: question.rows, count: question.count };

        return res.status(200).json({
            data: data.rows,
            meta: {
                page: pageInt,
                limit: limitInt,
                total_data: data.count,
                total_page: Math.ceil(data.count / limitInt)
            }
        });
    } catch (err) {
        LogUtils.logError({
            function_name: 'admin_getListQuestion',
            message: err.message
        });
        return res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
    }
};

module.exports = exports;
