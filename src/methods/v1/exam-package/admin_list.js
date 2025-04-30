const ListValidation = require('../../../validations/v1/exam-package/list');
const ExamPackageRepository = require('../../../repositories/mysql/exam_package');
const ExamPackageAdminTransformer = require('../../../transformers/v1/exam-package/admin_list');
const Language = require('../../../languages');
const LogUtils = require('../../../utils/logger');

let lang;

exports.getListExamPackage = async (req, res) => {
    try {
        const { query } = req;
        lang = Language.getLanguage(req.locale);
        let input;
        try {
            input = await ListValidation(lang).validateAsync(query);
        } catch (err) {
            return res.status(400).json({ message: err.message });
        }

        // Untuk admin: tidak perlu filter user, purchased, free, dsb
        const whereClause = {};
        const optionsClause = {
            order: [['created_at', 'desc']],
            limit: input.limit,
            offset: (input.page - 1) * input.limit
        };

        // Ambil semua exam_package
        const examPackages = await ExamPackageRepository.findAndCountAll(whereClause, optionsClause);
        const data = { rows: examPackages.rows, count: examPackages.count };

        return res.status(200).json({
            data: data.rows.map(ExamPackageAdminTransformer.item),
            meta: {
                page: input.page,
                limit: input.limit,
                totalData: data.count,
                totalPage: Math.ceil(data.count / input.limit)
            }
        });
    } catch (err) {
        LogUtils.loggingError({
            functionName: 'admin_getListExamPackage',
            message: err.message
        });
        return res.status(500).json({ message: lang.INTERNAL_SERVER_ERROR });
    }
};

module.exports = exports;
