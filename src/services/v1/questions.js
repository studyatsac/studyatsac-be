const ExamRepository = require('../../repositories/mysql/exam');
const ResourcesRepository = require('../../repositories/mysql/resources');
const SectionRepository = require('../../repositories/mysql/section');
const QuestionRepository = require('../../repositories/mysql/question');
const Response = require('../../utils/response');

const createQuestion = async (input, opts = {}) => {
    const language = opts.lang;

    let exam;
    if (input.examId) {
        exam = await ExamRepository.findOne({ id: input.examId });
        if (!exam) {
            return Response.formatServiceReturn(false, 404, null, language.QUESTION.EXAM_NOT_FOUND);
        }
    }

    let resource;
    if (input.resource) {
        resource = await ResourcesRepository.findOne({ id: input.resource });
        if (!resource) {
            return Response.formatServiceReturn(false, 404, null, language.QUESTION.RESOURCE_NOT_FOUND);
        }
    }

    let section;
    if (input.sectionId) {
        section = await SectionRepository.findOne({ id: input.sectionId });
        if (!section) {
            return Response.formatServiceReturn(false, 404, null, language.QUESTION.SECTION_NOT_FOUND);
        }
    }

    if (!exam && !resource && !section) {
        return Response.formatServiceReturn(false, 404, null, language.QUESTION.CANNOT_BE_EMPTY);
    }

    const questionData = {
        questionNumber: input.questionNumber,
        question: input.question,
        correctAnswer: input.correctAnswer,
        answerOption: input.answerOption,
        ...(exam ? { examId: exam.id } : {}),
        ...(resource ? { resource_id: resource.id } : {}),
        ...(section ? { section_id: section.id } : {}),
        explanation: input.explanation,
        score: input.score
    };

    const question = await QuestionRepository.create(questionData);
    if (!question) {
        return Response.formatServiceReturn(
            false,
            500,
            null,
            language.QUESTION.CREATE_FAILED
        );
    }

    return Response.formatServiceReturn(true, 200, question, null);
};

exports.createQuestion = createQuestion;
module.exports = exports;
