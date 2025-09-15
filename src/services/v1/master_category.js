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

const getDetailCategory = async (input, opts = {}) => {
    const language = opts.lang;

    const masterCategory = await MasterCategoryRepository.findOne({ uuid: input.uuid });
    if (!masterCategory) {
        return Response.formatServiceReturn(false, 404, null, language.MASTER_CATEGORY.NOT_FOUND);
    }

    return Response.formatServiceReturn(true, 200, masterCategory, language.MASTER_CATEGORY.SUCCESS_GET_DETAIL);
};

const createCategory = async (input, opts = {}) => {
    const language = opts.lang;

    const existingCategory = await MasterCategoryRepository.findOne({ title: input.title });
    if (existingCategory) {
        return Response.formatServiceReturn(false, 409, null, language.MASTER_CATEGORY.ALREADY_EXISTS);
    }

    const masterCategory = await MasterCategoryRepository.create({
        title: input.title
    });

    if (!masterCategory) {
        return Response.formatServiceReturn(false, 500, null, language.MASTER_CATEGORY.CREATE_FAILED);
    }

    return Response.formatServiceReturn(true, 200, masterCategory, language.MASTER_CATEGORY.CREATE_SUCCESS);
};

const updateCategory = async (input, opts = {}) => {
    const language = opts.lang;

    const masterCategory = await MasterCategoryRepository.findOne({ uuid: input.uuid });
    if (!masterCategory) {
        return Response.formatServiceReturn(false, 404, null, language.MASTER_CATEGORY.NOT_FOUND);
    }

    if (input.title) {
        const existingCategory = await MasterCategoryRepository.findOne({ title: input.title });
        if (existingCategory && existingCategory.id !== masterCategory.id) {
            return Response.formatServiceReturn(false, 409, null, language.MASTER_CATEGORY.ALREADY_EXISTS);
        }
    }

    const updatedItem = await MasterCategoryRepository.update(
        { uuid: input.uuid },
        { title: input.title }
    );
    if ((Array.isArray(updatedItem) && !updatedItem[0]) || !updatedItem) {
        return Response.formatServiceReturn(false, 500, null, language.MASTER_CATEGORY.UPDATE_FAILED);
    }

    const updatedCategory = await MasterCategoryRepository.findOne({ uuid: input.uuid });

    return Response.formatServiceReturn(true, 200, updatedCategory, language.MASTER_CATEGORY.UPDATE_SUCCESS);
};

const deleteCategory = async (input, opts = {}) => {
    const language = opts.lang;

    const masterCategory = await MasterCategoryRepository.findOne({ uuid: input.uuid });
    if (!masterCategory) {
        return Response.formatServiceReturn(false, 404, null, language.MASTER_CATEGORY.NOT_FOUND);
    }

    await MasterCategoryRepository.delete({ id: masterCategory.id });

    return Response.formatServiceReturn(true, 200, masterCategory, language.MASTER_CATEGORY.DELETE_SUCCESS);
};
exports.getListCategory = getListCategory;
exports.getDetailCategory = getDetailCategory;
exports.createCategory = createCategory;
exports.updateCategory = updateCategory;
exports.deleteCategory = deleteCategory;

module.exports = exports;
