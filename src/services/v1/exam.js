const Moment = require('moment');
const UserExamRepository = require('../../repositories/mysql/user_exam');
const ExamPackageRepository = require('../../repositories/mysql/exam_package');
const UserPurchaseRepository = require('../../repositories/mysql/user_purchase');
const ExamPackageMappingRepository = require('../../repositories/mysql/exam_package_mapping');
const ExamRepository = require('../../repositories/mysql/exam');
const UserAnswerRepository = require('../../repositories/mysql/user_anwer');
const QuestionRepository = require('../../repositories/mysql/question');
const IeltsScoreRepository = require('../../repositories/mysql/ielts_score');
const IeltsWritingSubmissionRepository = require('../../repositories/mysql/ielts_writing_submission');
const UserRepository = require('../../repositories/mysql/user');
const Response = require('../../utils/response');
const Helpers = require('../../utils/helpers');

const getActiveExam = async (input, opts = {}) => {
    const language = opts.lang;

    const whereClauseUserExam = {
        userId: input.user.id
    };

    const activeExam = await UserExamRepository.findActiveExam(whereClauseUserExam);

    if (!activeExam) {
        return Response.formatServiceReturn(true, 200, null, null);
    }

    const exam = await ExamRepository.findOne({ id: activeExam.examId });

    if (!exam) {
        return Response.formatServiceReturn(false, 404, null, language.EXAM_NOT_FOUND);
    }

    const data = {
        activeExam: activeExam.toJSON(),
        exam: exam.toJSON()
    };

    return Response.formatServiceReturn(true, 200, data, null);
};

const startExam = async (input, opts = {}) => {
    const language = opts.lang;

    const activeExam = await getActiveExam(input, opts);

    if (activeExam.status && activeExam.data) {
        return Response.formatServiceReturn(false, 429, null, language.ACTIVE_EXAM_EXIST);
    }

    const examPackage = await ExamPackageRepository.findOne({ uuid: input.examPackageUuid });

    if (!examPackage) {
        return Response.formatServiceReturn(false, 404, null, language.EXAM_PACKAGE_NOT_FOUND);
    }

    const userPurchase = await UserPurchaseRepository.findOneExcludeExpired({
        examPackageId: examPackage.id,
        userId: input.user.id
    });

    if (!userPurchase) {
        return Response.formatServiceReturn(false, 404, null, language.EXAM_PACKAGE_NOT_FOUND);
    }

    const exam = await ExamRepository.findOne({ uuid: input.examUuid });

    if (!exam) {
        return Response.formatServiceReturn(false, 404, null, language.EXAM_NOT_FOUND);
    }

    const examPackageMapping = await ExamPackageMappingRepository.findOne({
        examPackageId: examPackage.id,
        examId: exam.id
    });

    if (!examPackageMapping) {
        return Response.formatServiceReturn(false, 404, null, language.EXAM_PACKAGE_AND_EXAM_NOT_FOUND);
    }

    const questions = await QuestionRepository.findAll(
        { examId: exam.id },
        { order: [['question_number', 'asc']] }
    );

    const userExamPayload = {
        userId: input.user.id,
        examId: exam.id,
        startDate: Moment.utc().format(),
        totalQuestion: exam.numberOfQuestion
    };

    const userExamCreated = await UserExamRepository.create(userExamPayload);

    // Ambil resources unik dari questions
    const resources = [];
    const resourceIds = new Set();
    questions.forEach(q => {
        if (q.resource && q.resource.id && !resourceIds.has(q.resource.id)) {
            resources.push(q.resource);
            resourceIds.add(q.resource.id);
        }
    });

    // Ambil sections unik dari questions
    const sections = [];
    const sectionIds = new Set();
    questions.forEach(q => {
        if (q.section && q.section.id && !sectionIds.has(q.section.id)) {
            sections.push(q.section);
            sectionIds.add(q.section.id);
        }
    });

    const data = {
        userExam: userExamCreated,
        exam,
        questions,
        resources,
        sections
    };

    return Response.formatServiceReturn(true, 200, data, null);
};

const getUserExamWithQuestionAndAnswer = async (input, opts = {}) => {
    const language = opts.lang;

    const userExam = await UserExamRepository.findOne({
        userId: input.user.id,
        uuid: input.userExamUuid
    });

    if (!userExam) {
        return Response.formatServiceReturn(false, 404, null, language.EXAM_NOT_FOUND);
    }

    const exam = await ExamRepository.findOne({ id: userExam.examId });

    if (!exam) {
        return Response.formatServiceReturn(false, 404, null, language.EXAM_NOT_FOUND);
    }

    const questions = await QuestionRepository.findAllWithUserAnswer({
        userExamId: userExam.id,
        examId: userExam.examId
    });

    // Ambil resources unik dari questions
    const resources = [];
    const resourceIds = new Set();
    questions.forEach(q => {
        if (q.resource && q.resource.id && !resourceIds.has(q.resource.id)) {
            resources.push(q.resource);
            resourceIds.add(q.resource.id);
        }
    });

    // Ambil sections unik dari questions
    const sections = [];
    const sectionIds = new Set();
    questions.forEach(q => {
        if (q.section && q.section.id && !sectionIds.has(q.section.id)) {
            sections.push(q.section);
            sectionIds.add(q.section.id);
        }
    });

    const data = {
        exam,
        userExam,
        questions,
        resources,
        sections
    };

    return Response.formatServiceReturn(true, 200, data, null);
};

const submitAnswer = async (input, opts = {}) => {
    const language = opts.lang;

    const userExam = await UserExamRepository.findActiveExam({
        uuid: input.userExamUuid,
        userId: input.user.id
    });

    if (!userExam) {
        return Response.formatServiceReturn(false, 404, null, language.EXAM_NOT_FOUND);
    }

    const question = await QuestionRepository.findOne({
        uuid: input.questionUuid,
        examId: userExam.examId
    });

    if (!question) {
        return Response.formatServiceReturn(false, 404, null, language.QUESTION_NOT_FOUND);
    }

    const userAnswered = await UserAnswerRepository.findOne({
        userExamId: userExam.id,
        questionId: question.id
    });

    const userAnswerInput = input.answer.trim().toLowerCase();
    const correctAnswer = question.correctAnswer.trim().toLowerCase();
    const isAnswerCorrect = userAnswerInput === correctAnswer;

    const payloadUserAnswer = {
        answer: userAnswerInput,
        isCorrect: isAnswerCorrect
    };

    if (userAnswered) {
        await UserAnswerRepository.update({ id: userAnswered.id }, payloadUserAnswer);
    } else {
        payloadUserAnswer.userExamId = userExam.id;
        payloadUserAnswer.questionId = question.id;

        await UserAnswerRepository.create(payloadUserAnswer);
    }

    return Response.formatServiceReturn(true, 200, null, null);
};

const submitIeltsScore = async (input, opts = {}) => {
    const userAlreadySubmitScore = await IeltsScoreRepository.findOne({ user_id: input.user.id });
    const readingScore = input.readingScore || null;
    const listeningScore = input.listeningScore || null;
    const overallScore = input.score;

    await IeltsScoreRepository.create({
        userId: input.user.id,
        readingScore,
        listeningScore,
        overallScore,
        taskId: input.id
    });

    if (!userAlreadySubmitScore && input.nip && input.faculty) {
        await UserRepository.update({ id: input.user.id }, { nip: input.nip, faculty: input.faculty });
    }

    return Response.formatServiceReturn(true, 201, { readingScore, listeningScore, score: overallScore }, null);
};

const getIeltsScores = async (input, opts = {}) => {
    const scores = await IeltsScoreRepository.findAndCountAll(
        { user_id: input.user.id, task_id: input.id },
        {
            order: [['created_at', 'desc']],
            limit: input.limit,
            offset: Helpers.setOffset(input.page, input.limit)
        }
    );

    const data = { rows: scores.rows, count: scores.count };

    return Response.formatServiceReturn(true, 200, data, null);
};

const getIeltsWritingSubmissions = async (input, opts = {}) => {
    const scores = await IeltsWritingSubmissionRepository.findAndCountAll(
        { user_id: input.user.id, task_id: input.id },
        {
            order: [['created_at', 'desc']],
            limit: input.limit,
            offset: Helpers.setOffset(input.page, input.limit)
        }
    );

    const data = { rows: scores.rows, count: scores.count };

    return Response.formatServiceReturn(true, 200, data, null);
};

const submitIeltsWriting = async (input, opts = {}) => {
    const payloads = input.tasks.map((task) => ({
        taskId: input.id,
        userId: input.user.id,
        taskType: task.type || null,
        topic: task.topic || null,
        writingText: task.text,
        score: task.score || null
    }));

    await IeltsWritingSubmissionRepository.bulkCreate(payloads);

    return Response.formatServiceReturn(true, 201, { score: input.score }, null);
};

const finishExam = async (input, opts = {}) => {
    const language = opts.lang;

    const userExam = await UserExamRepository.findActiveExam({
        uuid: input.userExamUuid,
        userId: input.user.id
    });

    if (!userExam) {
        return Response.formatServiceReturn(false, 404, null, language.EXAM_NOT_FOUND);
    }

    const exam = await ExamRepository.findOne({ id: userExam.examId });

    if (!exam) {
        return Response.formatServiceReturn(false, 404, null, language.EXAM_NOT_FOUND);
    }

    const userAnswers = await UserAnswerRepository.findAllWithQuestion({
        userExamId: userExam.id
    });

    const correctAnswers = userAnswers.filter((userAnswer) => userAnswer.isCorrect);
    const questions = correctAnswers.map((correctAnswer) => correctAnswer.Question);

    const userExamUpdatePayload = {
        endDate: Moment.utc().format(),
        totalCorrectAnswer: correctAnswers.length,
        totalWrongAnswer: exam.numberOfQuestion - correctAnswers.length,
        totalScore: questions.reduce((accumulator, current) => accumulator + current.score, 0)
    };

    await UserExamRepository.update({ id: userExam.id }, userExamUpdatePayload);

    const userExamResponse = {
        ...userExam.toJSON(),
        ...userExamUpdatePayload
    };

    return Response.formatServiceReturn(true, 200, userExamResponse, null);
};

const examHistory = async (input, opts = {}) => {
    const language = opts.lang;

    const exam = await ExamRepository.findOne({ uuid: input.examUuid });

    if (!exam) {
        return Response.formatServiceReturn(false, 404, null, language.EXAM_NOT_FOUND);
    }

    const userExams = await UserExamRepository.findAndCountAll(
        {
            examId: exam.id,
            userId: input.user.id
        },
        {
            order: [['start_date', 'asc']]
        }
    );

    return Response.formatServiceReturn(true, 200, userExams, null);
};

const examHistoryDetail = async (input, opts = {}) => {
    const language = opts.lang;

    const exam = await ExamRepository.findOne({ uuid: input.examUuid });

    if (!exam) {
        return Response.formatServiceReturn(false, 404, null, language.EXAM_NOT_FOUND);
    }

    const userExam = await UserExamRepository.findTheFinishedOne({
        uuid: input.userExamUuid,
        userId: input.user.id,
        examId: exam.id
    });

    if (!userExam) {
        return Response.formatServiceReturn(false, 404, null, language.EXAM_NOT_FOUND);
    }

    const questions = await QuestionRepository.findAllWithUserAnswer({
        userExamId: userExam.id,
        examId: userExam.examId
    });

    console.log(questions);
    const data = {
        exam,
        userExam,
        questions,
        isFinishedExam: true
    };

    return Response.formatServiceReturn(true, 200, data, null);
};

exports.getActiveExam = getActiveExam;
exports.startExam = startExam;
exports.getUserExamWithQuestionAndAnswer = getUserExamWithQuestionAndAnswer;
exports.submitAnswer = submitAnswer;
exports.finishExam = finishExam;
exports.examHistory = examHistory;
exports.examHistoryDetail = examHistoryDetail;
exports.submitIeltsScore = submitIeltsScore;
exports.submitIeltsWriting = submitIeltsWriting;
exports.getIeltsScores = getIeltsScores;
exports.getIeltsWritingSubmissions = getIeltsWritingSubmissions;

module.exports = exports;
