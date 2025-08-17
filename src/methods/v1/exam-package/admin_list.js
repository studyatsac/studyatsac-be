const ListValidation = require('../../../validations/v1/exam-package/list');
const ExamPackageRepository = require('../../../repositories/mysql/exam_package');
const ExamPackageAdminTransformer = require('../../../transformers/v1/exam-package/admin_list');
const Language = require('../../../languages');
const LogUtils = require('../../../utils/logger');
const { Op } = require('sequelize');

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

        // Ambil orderBy dan order langsung dari req.query tanpa validasi
        const orderBy = req.query.orderBy || 'created_at';
        const order = req.query.order || 'desc';

        // Untuk admin: tidak perlu filter user, purchased, free, dsb
        const where_clause = {};
        if (input.search) {
            where_clause[Op.or] = [
                { title: { [Op.like]: `%${input.search}%` } },
                { description: { [Op.like]: `%${input.search}%` } },
                { price: { [Op.like]: `%${input.search}%` } }
            ];
        }

        const options_clause = {
            where: where_clause,
            order: [[orderBy, order]],
            limit: input.limit,
            offset: (input.page - 1) * input.limit
        };

        // Ambil semua exam_package
        const exam_packages = await ExamPackageRepository.findAndCountAll(where_clause, options_clause);
        const data = { rows: exam_packages.rows, count: exam_packages.count };

        return res.status(200).json({
            data: data.rows.map(ExamPackageAdminTransformer.item),
            meta: {
                page: input.page,
                limit: input.limit,
                total_data: data.count,
                total_page: Math.ceil(data.count / input.limit)
            }
        });
    } catch (err) {
        LogUtils.logError({
            function_name: 'admin_getListExamPackage',
            message: err.message
        });
        return res.status(500).json({ message: lang.INTERNAL_SERVER_ERROR });
    }
};

module.exports = exports;
