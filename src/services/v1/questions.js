const ExamPackageRepository = require('../../repositories/mysql/exam_package');
const ResourcesRepository = require('../../repositories/mysql/resources');

const createQuestion = async (input, opts = {}) => {
    const language = opts.lang;

    let examPackage;
    if (input.examPackageUuid) {
        examPackage = await ExamPackageRepository.findOne({ uuid: input.examPackageUuid });
        if (!examPackage) {
            return Response.formatServiceReturn(false, 404, null, language.EXAM_PACKAGE_NOT_FOUND);
        }
    }

    let resource;
    if (input.resourceUuid) {
        resource = await ResourcesRepository.findOne({ uuid: input.resourceUuid });
        if (!resource) {
            return Response.formatServiceReturn(false, 404, null, language.RESOURCE_NOT_FOUND);
        }
    }

    if (!examPackage && !resource) {
        return Response.formatServiceReturn(false, 404, null, language.QUESTION.BOTH_NOT_FOUND);
    }

    const questionData = {
        question_number: input.questionNumber,
        question: input.question,
        correct_answer: input.correctAnswer,
        answer_option: input.answerOption,
        description: input.description,
        ...(examPackage ? { examPackageId: examPackage.id } : {}),
        ...(resource ? { resourceId: resource.id } : {}),
        explanation: input.explanation,
        score: input.score
    };

    return Response.formatServiceReturn(true, 200, questionData, null);
};

exports.createQuestion = createQuestion;
module.exports = exports;
