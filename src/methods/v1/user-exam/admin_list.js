const UserExamRepository = require('../../../repositories/mysql/user_exam');
const Language = require('../../../languages');
const LogUtils = require('../../../utils/logger');

exports.getListUserExam = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const lang = Language.getLanguage(req.locale);
        const pageInt = parseInt(page, 10) || 1;
        const limitInt = parseInt(limit, 10) || 10;
        const offset = (pageInt - 1) * limitInt;

        const whereClause = {};
        const optionsClause = {
            order: [['created_at', 'desc']],
            limit: limitInt,
            offset: offset
        };

        const exams = await UserExamRepository.findAndCountAll(whereClause, optionsClause);
        const data = { rows: exams.rows, count: exams.count };

        return res.status(200).json({
            data: data.rows,
            meta: {
                page: pageInt,
                limit: limitInt,
                totalData: data.count,
                totalPage: Math.ceil(data.count / limitInt)
            }
        });
    } catch (err) {
        LogUtils.loggingError({
            functionName: 'admin_getListUserExam',
            message: err.message
        });
        return res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
    }
};

module.exports = exports;
