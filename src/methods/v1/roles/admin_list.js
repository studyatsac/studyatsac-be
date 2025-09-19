const RolesService = require('../../../services/v1/roles');
const Language = require('../../../languages');
const ListValidation = require('../../../validations/custom/list');
require('../../../transformers/v1/category/list');
const LogUtils = require('../../../utils/logger');
const RoleTransformer = require('../../../transformers/v1/roles/list');

let lang;

exports.getListRoles = async (req, res) => {
    try {
        const { query } = req;

        lang = Language.getLanguage(req.locale);

        let input;

        try {
            input = await ListValidation(lang).validateAsync(query);
        } catch (err) {
            return res.status(400).json({ message: err.message });
        }

        const result = await RolesService.getListRoles(input, { lang });

        if (!result.status) {
            return res.status(result.code).json({ message: result.message });
        }

        const data = result.data || {};
        const rows = data.rows || [];

        return res.status(200).json({
            code: result.code,
            messages: result.message,
            data: rows.map(RoleTransformer.item),
            meta: {
                page: input.page,
                limit: input.limit,
                total_data: data.count,
                total_page: Math.ceil(data.count / input.limit)
            }
        });
    } catch (err) {
        LogUtils.logError({
            function_name: 'getListRole',
            message: err.message
        });

        return res.status(500).json({ message: lang.INTERNAL_SERVER_ERROR });
    }
};
// ...

// exports.getListRoles = async (req, res) => {
//     try {
//         const { page = 1, limit = 10, search, orderBy, order, examPackageId, masterCategoryId } = req.query;
//
//         // Validasi input
//         const pageInt = parseInt(page, 10) || 1;
//         const limitInt = parseInt(limit, 10) || 10;
//
//         // // Validasi bahwa setidaknya satu ID filter harus ada (meniru logika wajib 'examPackageId')
//         // if (!examPackageId && !masterCategoryId) {
//         //     return res.status(400).json({ message: 'At least one of role is required for filtering.' });
//         // }
//
//         // Panggil Service
//         const result = await RolesService.getListRoles({
//             page: pageInt,
//             limit: limitInt,
//             search,
//             orderBy: orderBy || 'created_at',
//             order: order || 'desc',
//             examPackageId,
//             masterCategoryId
//         }, { lang: req.lang }); // Pastikan lang dikirim ke service
//
//         if (!result.success) {
//             return res.status(result.code).json({ message: result.message });
//         }
//
//         const { rows, count } = result.data;
//
//         // Kembalikan respons dengan format meta data
//         return res.status(result.code).json({
//             data: rows,
//             meta: {
//                 page: pageInt,
//                 limit: limitInt,
//                 total_data: count,
//                 total_page: Math.ceil(count / limitInt)
//             }
//         });
//     } catch (err) {
//         return res.status(500).json({ message: err.message });
//     }
// };
