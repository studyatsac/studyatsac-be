const UserExamRepository = require('../../../repositories/mysql/user_exam');
const Models = require('../../../models/mysql');
const Language = require('../../../languages');
const LogUtils = require('../../../utils/logger');
const { Op } = require('sequelize');

exports.getListUserExam = async (req, res) => {
    try {
        const { page = 1, limit = 10, search } = req.query;
        const lang = Language.getLanguage(req.locale);
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

        const optionsClause = {
            where: whereClause,
            order: [['created_at', 'desc']],
            limit: limitInt,
            offset: offset,
            include: [
                {
                    model: Models.User,
                    attributes: ['id', 'full_name', 'email', 'institution_name', 'faculty', 'nip']
                },
                {
                    model: Models.Exam,
                    attributes: ['id', 'title', 'number_of_question', 'duration', 'description', 'category_id', 'grade_rules', 'additional_information']
                }
            ]
        };

        const exams = await UserExamRepository.findAndCountAll(whereClause, optionsClause);
        const data = { rows: exams.rows, count: exams.count };

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
        LogUtils.loggingError({
            function_name: 'admin_getListUserExam',
            message: err.message
        });
        return res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
    }
};

module.exports = exports;
