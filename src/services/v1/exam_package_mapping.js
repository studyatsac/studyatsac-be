const ExamPackageRepository = require('../../repositories/mysql/exam_package');
const Response = require('../../utils/response');
const ExamPackageMappingRepository = require('../../repositories/mysql/exam_package_mapping');
const Helpers = require('../../utils/helpers');
const ExamRepository = require('../../repositories/mysql/exam');

const createExamPackageMapping = async (input, opts = {}) => {
    const language = opts.lang;

    const examPackage = await ExamPackageRepository.findOne({ id: input.examPackageId });
    if (!examPackage) {
        return Response.formatServiceReturn(false, 404, null, language.EXAM_PACKAGE_NOT_FOUND);
    }

    const exam = await ExamRepository.findOne({ id: input.examId });
    if (!exam) {
        return Response.formatServiceReturn(false, 404, null, language.EXAM_NOT_FOUND);
    }

    const existingMapping = await ExamPackageMappingRepository.findOne({
        examPackageId: input.examPackageId,
        examId: input.examId
    });
    if (existingMapping) {
        return Response.formatServiceReturn(false, 409, null, language.EXAM_PACKAGE_MAPPING.ALREADY_EXISTS);
    }

    const createdMapping = await ExamPackageMappingRepository.create({
        examPackageId: input.examPackageId,
        examId: input.examId
    });

    if (!createdMapping) {
        return Response.formatServiceReturn(false, 500, null, language.EXAM_PACKAGE_MAPPING.CREATE_FAILED);
    }

    return Response.formatServiceReturn(true, 201, createdMapping, language.EXAM_PACKAGE_MAPPING.CREATE_SUCCESS);
};
const getExamMappingList = async (input, opts = {}) => {
    const language = opts.language;

    const examPackage = await ExamPackageRepository.findOne({
        id: input.examPackageId
    });
    if (!examPackage) {
        return Response.formatServiceReturn(false, 404, null, language.EXAM_PACKAGE_NOT_FOUND);
    }

    const whereClause = {
        examPackageIds: input.examPackageIds,
        categoryId: input.categoryId
    };

    const optionsClause = {
        order: [['createdAt', 'asc']],
        limit: input.limit,
        offset: Helpers.setOffset(input.page, input.limit)
    };
    const result = await ExamPackageMappingRepository.findAllWithExamAndPackage(whereClause, optionsClause);

    if (!result || !result.length) {
        return Response.formatServiceReturn(false, 404, null, language.EXAM_PACKAGE_MAPPING.NOT_FOUND);
    }
    const rows = result.map(mapping => ({
        ...mapping.get({ plain: true }),
        exam: mapping.Exam // Mengambil data exam dari properti yang benar
    }));

    return Response.formatServiceReturn(true, 200, { rows, count: result.length }, null);
};

const getExamPackageMappingDetail = async (input, opts = {}) => {
    const language = opts.lang;

    const packageMapping = await ExamPackageMappingRepository.findOne({ uuid: input.uuid });
    if (!packageMapping) {
        return Response.formatServiceReturn(false, 404, null, language.EXAM_PACKAGE_NOT_FOUND);
    }

    return Response.formatServiceReturn(true, 200, packageMapping, language.EXAM_PACKAGE_MAPPING.SUCCESS_GET_DETAIL);
};

const updateExamPackageMapping = async (input, opts = {}) => {
    const language = opts.lang;

    const mapping = await ExamPackageMappingRepository.findOne({ uuid: input.uuid });
    if (!mapping) {
        return Response.formatServiceReturn(false, 404, null, language.EXAM_PACKAGE_MAPPING.NOT_FOUND);
    }

    const examPackage = await ExamPackageRepository.findOne({ id: input.examPackageId });
    if (!examPackage) {
        return Response.formatServiceReturn(false, 404, null, language.EXAM_PACKAGE.NOT_FOUND);
    }

    const exam = await ExamRepository.findOne({ id: input.examId });
    if (!exam) {
        return Response.formatServiceReturn(false, 404, null, language.EXAM.NOT_FOUND);
    }

    const payload = {
        examPackageId: input.examPackageId,
        examId: input.examId
    };

    const updated = await ExamPackageMappingRepository.update(payload, { uuid: input.uuid });

    if (!updated || updated[0] === 0) {
        return Response.formatServiceReturn(false, 500, null, language.EXAM_PACKAGE_MAPPING.UPDATE_FAILED);
    }

    const updatedMapping = await ExamPackageMappingRepository.findOne({ uuid: input.uuid });
    return Response.formatServiceReturn(true, 200, updatedMapping, language.EXAM_PACKAGE_MAPPING.UPDATE_SUCCESS);
};

const deleteExamPackageMapping = async (input, opts = {}) => {
    const language = opts.lang;

    const examPackage = await ExamPackageRepository.findOne({ id: input.examPackageId });
    if (!examPackage) {
        return Response.formatServiceReturn(false, 404, null, language.EXAM_PACKAGE_NOT_FOUND);
    }

    const deletedCount = await ExamPackageMappingRepository.delete({
        examPackageId: input.examPackageId,
        examIds: input.examIds // Pass examIds directly to the repository
    });

    if (deletedCount === 0) {
        return Response.formatServiceReturn(false, 404, null, language.EXAM_PACKAGE_MAPPING.NOT_FOUND);
    }

    return Response.formatServiceReturn(true, 200, null, language.EXAM_PACKAGE_MAPPING.DELETE_SUCCESS);
};

exports.createExamPackageMapping = createExamPackageMapping;
exports.getExamMappingList = getExamMappingList;
exports.getExamPackageMappingDetail = getExamPackageMappingDetail;
exports.updateExamPackageMapping = updateExamPackageMapping;
exports.deleteExamPackageMapping = deleteExamPackageMapping;
module.exports = exports;
