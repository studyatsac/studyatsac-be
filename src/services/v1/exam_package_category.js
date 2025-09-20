const { Op } = require('sequelize');
const ExamPackageCategoryRepository = require('../../repositories/mysql/exam_package_category');
const ExamPackageRepository = require('../../repositories/mysql/exam_package');
const MasterCategoryRepository = require('../../repositories/mysql/master_category');
const Response = require('../../utils/response');
const Models = require('../../models/mysql');
const Helpers = require('../../utils/helpers');

const getListExamPackageCategory = async (input, opts = {}) => {
    const language = opts.lang;

    const whereClause = {};
    if (input.search) {
        whereClause[Op.or] = [
            { '$MasterCategory.title$': { [Op.like]: `%${input.search}%` } },
            { '$ExamPackage.title$': { [Op.like]: `%${input.search}%` } }
        ];
    }

    const optionsClause = {
        where: whereClause,
        offset: Helpers.setOffset(input.page, input.limit),
        limit: input.limit,
        order: [[input.orderBy, input.order]],
        include: [
            {
                model: Models.ExamPackage,
                as: 'exam_package',
                attributes: ['id', 'uuid', 'title', 'description', 'additional_information', 'price', 'image_url', 'is_private']
            },
            {
                model: Models.MasterCategory,
                as: 'master_category',
                attributes: ['id', 'uuid', 'title']
            }
        ]
    };

    const result = await ExamPackageCategoryRepository.findAllExamPackageWithCategory(whereClause, optionsClause);

    if (!result || !result.rows.length) {
        return Response.formatServiceReturn(false, 404, null, language.EXAM_PACKAGE_CATEGORY.NOT_FOUND);
    }

    result.rows = result.rows.map((item) => ({
        uuid: item.uuid,
        exam_package: {
            id: item.exam_package.id,
            uuid: item.exam_package.uuid,
            title: item.exam_package.title
        },
        master_category: {
            id: item.master_category.id,
            uuid: item.master_category.uuid,
            title: item.master_category.title
        }
    }));
    return Response.formatServiceReturn(true, 200, { result }, 'Success retrieved exam-package category');
};

const getDetailExamPackageCategory = async (input, opts = {}) => {
    const language = opts.lang;

    const result = await ExamPackageCategoryRepository.findOne({ id: input.id });
    if (!result) {
        return Response.formatServiceReturn(false, 404, null, language.EXAM_PACKAGE_CATEGORY.NOT_FOUND);
    }
    return Response.formatServiceReturn(true, 200, result, language.EXAM_PACKAGE_CATEGORY.SUCCESS_GET_DETAIL);
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
        masterCategoryId: input.masterCategoryId
    });

    if (existingMapping) {
        return Response.formatServiceReturn(false, 409, null, language.EXAM_PACKAGE_CATEGORY.ALREADY_EXISTS);
    }

    const createdMapping = await ExamPackageCategoryRepository.create({
        examPackageId: input.examPackageId,
        masterCategoryId: input.masterCategoryId
    });

    if (!createdMapping) {
        return Response.formatServiceReturn(false, 500, null, language.EXAM_PACKAGE_CATEGORY.CREATE_FAILED);
    }

    return Response.formatServiceReturn(true, 201, createdMapping, language.EXAM_PACKAGE_CATEGORY.CREATE_SUCCESS);
};

const updateExamPackageCategory = async (input, opts = {}) => {
    const language = opts.lang;

    const mapping = await ExamPackageCategoryRepository.findOne({ id: input.id });

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

    const updated = await ExamPackageCategoryRepository.update(payload, { id: input.id });

    if (!updated || updated[0] === 0) {
        return Response.formatServiceReturn(false, 500, null, language.EXAM_PACKAGE_CATEGORY.UPDATE_FAILED);
    }

    const updatedMapping = await ExamPackageCategoryRepository.findOne({ id: input.id });
    return Response.formatServiceReturn(true, 200, updatedMapping, language.EXAM_PACKAGE_CATEGORY.UPDATE_SUCCESS);
};

const deleteExamPackageCategory = async (input, opts = {}) => {
    const language = opts.lang;

    const deletedCount = await ExamPackageCategoryRepository.delete({ id: input.id });

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
