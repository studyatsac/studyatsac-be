const MasterCategoryRepository = require('../../repositories/mysql/master_category');
const Helpers = require('../../utils/helpers');
const Response = require('../../utils/response');

const getListCategory = async (input, opts = {}) => {
    const whereClause = {};
    const optionsClause = {
        order: [['title', 'asc']],
        limit: input.limit,
        offset: Helpers.setOffset(input.page, input.limit)
    };

    const masterCategories = await MasterCategoryRepository.findAndCountAll(whereClause, optionsClause);

    const data = { rows: masterCategories.rows, count: masterCategories.count };

    return Response.formatServiceReturn(true, 200, data, null);
};

exports.getListCategory = getListCategory;

module.exports = exports;
