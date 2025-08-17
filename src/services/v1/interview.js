const InterviewRepository = require('../../repositories/mysql/interview');
const InterviewSectionRepository = require('../../repositories/mysql/interview_section');
const InterviewSectionQuestionRepository = require('../../repositories/mysql/interview_section_question');
const Response = require('../../utils/response');
const Models = require('../../models/mysql');

class InterviewError extends Error {}

const getInterview = async (input, opts = {}) => {
    const language = opts.lang;

    const interview = await InterviewRepository.findOne(
        input,
        {
            include: {
                model: Models.InterviewSection,
                as: 'interviewSections',
                ...(
                    opts.isDetailed
                        ? { include: { model: Models.InterviewSectionQuestion, as: 'interviewSectionQuestions' } }
                        : {}
                )
            }
        }
    );
    if (!interview) {
        return Response.formatServiceReturn(false, 404, null, language.INTERVIEW.NOT_FOUND);
    }

    return Response.formatServiceReturn(true, 200, interview, null);
};

const getAllInterview = async (input, opts = {}) => {
    const language = opts.lang;

    const allInterview = await InterviewRepository.findAll(input);

    if (!allInterview) {
        return Response.formatServiceReturn(false, 404, null, language.INTERVIEW.NOT_FOUND);
    }

    return Response.formatServiceReturn(true, 200, allInterview, null);
};

const createInterview = async (input, opts = {}) => {
    const language = opts.lang;

    try {
        const result = await Models.sequelize.transaction(async (trx) => {
            const interview = await InterviewRepository.create({
                title: input.title,
                description: input.description,
                isActive: input.isActive
            }, trx);
            if (!interview) throw new InterviewError(language.INTERVIEW.CREATE_FAILED);

            if (input.interviewSections && Array.isArray(input.interviewSections)) {
                const interviewSections = [];
                const pendingPromises = input.interviewSections.map(async (item) => {
                    const interviewSection = await InterviewSectionRepository.create({
                        interviewId: interview.id,
                        number: item.number,
                        title: item.title,
                        description: item.description,
                        systemPrompt: item.systemPrompt,
                        duration: item.duration
                    }, trx);
                    if (!interviewSection) throw new InterviewError(language.INTERVIEW_SECTION.CREATE_FAILED);

                    if (item.interviewSectionQuestions && Array.isArray(item.interviewSectionQuestions)) {
                        const interviewSectionQuestions = await InterviewSectionQuestionRepository.createMany(item.interviewSectionQuestions.map((question) => ({
                            sectionId: interviewSection.id,
                            number: question.number,
                            question: question.question,
                            systemPrompt: question.systemPrompt,
                            hint: question.hint
                        })), trx);
                        if (!interviewSectionQuestions) throw new InterviewError(language.INTERVIEW_SECTION_QUESTION.CREATE_FAILED);

                        interviewSection.interviewSectionQuestions = interviewSectionQuestions;
                    }

                    interviewSections.push(interviewSection);
                });

                await Promise.all(pendingPromises);

                interview.interviewSections = interviewSections;
            }

            return interview;
        });

        return Response.formatServiceReturn(true, 200, result, null);
    } catch (err) {
        if (err instanceof InterviewError) {
            return Response.formatServiceReturn(false, 500, null, err.message);
        }

        throw err;
    }
};

const updateInterview = async (input, opts = {}) => {
    const language = opts.lang;

    const interview = await InterviewRepository.findOne(
        { uuid: input.uuid },
        {
            include: {
                model: Models.InterviewSection,
                as: 'interviewSections',
                include: {
                    model: Models.InterviewSectionQuestion,
                    attributes: ['id', 'uuid'],
                    as: 'interviewSectionQuestions'
                }
            }
        }
    );

    if (!interview) {
        return Response.formatServiceReturn(false, 404, null, language.INTERVIEW.NOT_FOUND);
    }

    try {
        const result = await Models.sequelize.transaction(async (trx) => {
            const updatedItem = await InterviewRepository.update(
                {
                    title: input.title,
                    description: input.description,
                    isActive: input.isActive
                },
                { id: interview.id },
                trx
            );
            if ((Array.isArray(updatedItem) && !updatedItem[0]) || !updatedItem) {
                throw new InterviewError(language.INTERVIEW.UPDATE_FAILED);
            }

            if (input.interviewSections && Array.isArray(input.interviewSections)) {
                let inputInterviewSections = input.interviewSections;
                if (interview.interviewSections && Array.isArray(interview.interviewSections)) {
                    const deletedInterviewSections = interview.interviewSections.filter(
                        (item) => !input.interviewSections.find((i) => i.uuid === item.uuid)
                    );
                    if (deletedInterviewSections.length) {
                        const deleteCount = await InterviewSectionRepository.delete(
                            { id: deletedInterviewSections.map((item) => item.id) },
                            { force: true },
                            trx
                        );
                        // eslint-disable-next-line max-depth
                        if (!deleteCount) throw new InterviewError(language.INTERVIEW_SECTION.DELETE_FAILED);
                    }

                    inputInterviewSections = inputInterviewSections.map((item) => {
                        const interviewSection = interview.interviewSections.find((i) => i.uuid === item.uuid);
                        return ({
                            ...item,
                            ...(interviewSection && {
                                id: interviewSection.id,
                                currentInterviewSectionQuestions: interviewSection.interviewSectionQuestions
                            })
                        });
                    });
                }

                const updatingInterviewSections = inputInterviewSections.map(async (item) => {
                    const updatedInterviewSection = await InterviewSectionRepository.createOrUpdate({
                        id: item.id,
                        interviewId: interview.id,
                        number: item.number,
                        title: item.title,
                        description: item.description,
                        systemPrompt: item.systemPrompt,
                        duration: item.duration
                    }, trx);
                    if ((Array.isArray(updatedInterviewSection) && !updatedInterviewSection[0]) || !updatedInterviewSection) {
                        throw new InterviewError(language.INTERVIEW_SECTION.UPDATE_FAILED);
                    }

                    let interviewSectionId = item.id;
                    if (interviewSectionId == null && (Array.isArray(updatedInterviewSection) && updatedInterviewSection[0].id != null)) {
                        interviewSectionId = updatedInterviewSection[0].id;
                    }

                    if (item.interviewSectionQuestions && Array.isArray(item.interviewSectionQuestions)) {
                        let inputInterviewSectionQuestions = item.interviewSectionQuestions;
                        if (item.currentInterviewSectionQuestions && Array.isArray(item.currentInterviewSectionQuestions)) {
                            const deletedInterviewSectionQuestions = item.currentInterviewSectionQuestions.filter(
                                (question) => !inputInterviewSectionQuestions.find((i) => i.uuid === question.uuid)
                            );
                            if (deletedInterviewSectionQuestions.length) {
                                const deleteCount = await InterviewSectionQuestionRepository.delete(
                                    { id: deletedInterviewSectionQuestions.map((question) => question.id) },
                                    { force: true },
                                    trx
                                );
                                // eslint-disable-next-line max-depth
                                if (!deleteCount) throw new InterviewError(language.INTERVIEW_SECTION_QUESTION.DELETE_FAILED);
                            }

                            inputInterviewSectionQuestions = inputInterviewSectionQuestions.map((question) => {
                                const interviewSectionQuestion = item.currentInterviewSectionQuestions.find((i) => i.uuid === question.uuid);
                                return ({
                                    ...question,
                                    ...(interviewSectionQuestion && { id: interviewSectionQuestion.id })
                                });
                            });
                        }

                        const updatingInterviewSectionQuestions = inputInterviewSectionQuestions.map(async (question) => {
                            const updatedInterviewSectionQuestion = await InterviewSectionQuestionRepository.createOrUpdate({
                                id: question.id,
                                sectionId: interviewSectionId,
                                number: question.number,
                                question: question.question,
                                systemPrompt: question.systemPrompt,
                                hint: question.hint
                            }, trx);
                            if ((Array.isArray(updatedInterviewSectionQuestion) && !updatedInterviewSectionQuestion[0]) || !updatedInterviewSectionQuestion) {
                                throw new InterviewError(language.INTERVIEW_SECTION_QUESTION.UPDATE_FAILED);
                            }
                        });

                        await Promise.all(updatingInterviewSectionQuestions);

                        item.interviewSectionQuestions = inputInterviewSectionQuestions;
                    }
                });

                await Promise.all(updatingInterviewSections);

                interview.interviewSections = inputInterviewSections;
            }

            return interview;
        });

        return Response.formatServiceReturn(true, 200, result, null);
    } catch (err) {
        if (err instanceof InterviewError) {
            return Response.formatServiceReturn(false, 500, null, err.message);
        }

        throw err;
    }
};

const deleteInterview = async (input, opts = {}) => {
    const language = opts.lang;

    const interview = await InterviewRepository.findOne(input);

    if (!interview) {
        return Response.formatServiceReturn(false, 404, null, language.INTERVIEW.NOT_FOUND);
    }

    await InterviewRepository.delete({ id: interview.id });

    return Response.formatServiceReturn(true, 200, null, language.INTERVIEW.DELETE_SUCCESS);
};

exports.getInterview = getInterview;
exports.getAllInterview = getAllInterview;
exports.createInterview = createInterview;
exports.updateInterview = updateInterview;
exports.deleteInterview = deleteInterview;

module.exports = exports;
