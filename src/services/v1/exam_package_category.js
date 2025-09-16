const ExamPackageCategoryRepository = require('../../repositories/mysql/exam_package_category');
const ExamPackageRepository = require('../../repositories/mysql/exam_package');
const MasterCategoryRepository = require('../../repositories/mysql/master_category');
const Response = require('../../utils/response');
const Models = require('../../models/mysql');
const Helpers = require('../../utils/helpers');

const getListExamPackageCategory = async (input, opts = {}) => {
    const language = opts.lang;

    // Periksa apakah examPackageId atau masterCategoryId valid jika diberikan
    if (input.examPackageId) {
        const examPackage = await ExamPackageRepository.findOne({ id: input.examPackageId });
        if (!examPackage) {
            return Response.formatServiceReturn(false, 404, null, language.EXAM_PACKAGE_NOT_FOUND);
        }
    }

    if (input.masterCategoryId) {
        const masterCategory = await MasterCategoryRepository.findOne({ id: input.masterCategoryId });
        if (!masterCategory) {
            return Response.formatServiceReturn(false, 404, null, language.MASTER_CATEGORY.NOT_FOUND);
        }
    }

    const whereClause = {
        search: input.search,
        examPackageId: input.examPackageId,
        masterCategoryId: input.masterCategoryId,
    };

    const optionsClause = {
        offset: Helpers.setOffset(input.page, input.limit),
        limit: input.limit,
        order: [[input.orderBy, input.order]],
    };

    const result = await ExamPackageCategoryRepository.findAllExamPackageWithCategory(whereClause, optionsClause);

    if (!result || !result.rows.length) {
        return Response.formatServiceReturn(false, 404, null, language.EXAM_PACKAGE_CATEGORY.NOT_FOUND);
    }

    const rows = result.rows.map((item) => {
        return {
            uuid: item.uuid,
            exam_package: {
                uuid: item.exam_package.uuid,
                title: item.exam_package.title
            },
            master_category: {
                uuid: item.master_category.uuid,
                title: item.master_category.title
            }
        };
    });

    return Response.formatServiceReturn(true, 200, { rows, count: result.count }, 'Success retrieved exam-package category');
};

const getDetailExamPackageCategory = async (input, opts = {}) => {
    const language = opts.lang;

    const result = await ExamPackageCategoryRepository.findOne({ uuid: input.uuid }, { include: true });

    if (!result) {
        return Response.formatServiceReturn(false, 404, null, language.EXAM_PACKAGE_CATEGORY.NOT_FOUND);
    }

    const formattedData = {
        uuid: result.uuid,
        exam_package: {
            uuid: result.exam_package.uuid,
            title: result.exam_package.title
        },
        master_category: {
            uuid: result.master_category.uuid,
            title: result.master_category.title
        }
    };
    return Response.formatServiceReturn(true, 200, formattedData, language.EXAM_PACKAGE_CATEGORY.SUCCESS_GET_DETAIL);
};

const createExamPackageCategory = async (input, opts = {}) => {
    const language = opts.lang;

    const examPackage = await ExamPackageRepository.findOne({ id: input.examPackageId });
    if (!examPackage) {
        return Response.formatServiceReturn(false, 404, null, language.EXAM_PACKAGE_NOT_FOUND);
    }

    const masterCategory = await MasterCategoryRepository.findOne({ id: input.masterCategoryId });
    if (!masterCategory) {
        return Response.formatServiceReturn(false, 404, null, language.MASTER_CATEGORY.NOT_FOUND);
    }

    const existingMapping = await ExamPackageCategoryRepository.findOne({
        examPackageId: input.examPackageId,
        masterCategoryId: input.masterCategoryId,
    });

    if (existingMapping) {
        return Response.formatServiceReturn(false, 409, null, language.EXAM_PACKAGE_CATEGORY.ALREADY_EXISTS);
    }

    const createdMapping = await ExamPackageCategoryRepository.create({
        examPackageId: input.examPackageId,
        masterCategoryId: input.masterCategoryId,
    });

    if (!createdMapping) {
        return Response.formatServiceReturn(false, 500, null, language.EXAM_PACKAGE_CATEGORY.CREATE_FAILED);
    }

    return Response.formatServiceReturn(true, 201, createdMapping, language.EXAM_PACKAGE_CATEGORY.CREATE_SUCCESS);
};

const updateExamPackageCategory = async (input, opts = {}) => {
    const language = opts.lang;

    const mapping = await ExamPackageCategoryRepository.findOne({ uuid: input.uuid });

    if (!mapping) {
        return Response.formatServiceReturn(false, 404, null, language.EXAM_PACKAGE_CATEGORY.NOT_FOUND);
    }

    if (input.examPackageId) {
        const examPackage = await ExamPackageRepository.findOne({ id: input.examPackageId });
        if (!examPackage) {
            return Response.formatServiceReturn(false, 404, null, language.EXAM_PACKAGE_NOT_FOUND);
        }
    }

    if (input.masterCategoryId) {
        const masterCategory = await MasterCategoryRepository.findOne({ id: input.masterCategoryId });
        if (!masterCategory) {
            return Response.formatServiceReturn(false, 404, null, language.MASTER_CATEGORY.NOT_FOUND);
        }
    }

    // Periksa duplikasi jika salah satu ID diperbarui
    if (input.examPackageId || input.masterCategoryId) {
        const existingMapping = await ExamPackageCategoryRepository.findOne({
            examPackageId: input.examPackageId || mapping.examPackageId,
            masterCategoryId: input.masterCategoryId || mapping.masterCategoryId
        });
        if (existingMapping && existingMapping.id !== mapping.id) {
            return Response.formatServiceReturn(false, 409, null, language.EXAM_PACKAGE_CATEGORY.ALREADY_EXISTS);
        }
    }

    const payload = {};
    if (input.examPackageId) payload.examPackageId = input.examPackageId;
    if (input.masterCategoryId) payload.masterCategoryId = input.masterCategoryId;

    const updated = await ExamPackageCategoryRepository.update(payload, { uuid: input.uuid });

    if (!updated || updated[0] === 0) {
        return Response.formatServiceReturn(false, 500, null, language.EXAM_PACKAGE_CATEGORY.UPDATE_FAILED);
    }

    const updatedMapping = await ExamPackageCategoryRepository.findOne({ uuid: input.uuid });
    return Response.formatServiceReturn(true, 200, updatedMapping, language.EXAM_PACKAGE_CATEGORY.UPDATE_SUCCESS);
};

const deleteExamPackageCategory = async (input, opts = {}) => {
    const language = opts.lang;

    const deletedCount = await ExamPackageCategoryRepository.delete({ uuid: input.uuid });

    if (deletedCount === 0) {
        return Response.formatServiceReturn(false, 404, null, language.EXAM_PACKAGE_CATEGORY.NOT_FOUND);
    }

    return Response.formatServiceReturn(true, 200, null, language.EXAM_PACKAGE_CATEGORY.DELETE_SUCCESS);
};

module.exports = {
    getListExamPackageCategory,
    getDetailExamPackageCategory,
    createExamPackageCategory,
    updateExamPackageCategory,
    deleteExamPackageCategory
};
