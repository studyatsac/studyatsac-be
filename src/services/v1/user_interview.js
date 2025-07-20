const InterviewRepository = require('../../repositories/mysql/interview');
const UserInterviewRepository = require('../../repositories/mysql/user_interview');
const UserInterviewSectionRepository = require('../../repositories/mysql/user_interview_section');
const UserInterviewSectionAnswerRepository = require('../../repositories/mysql/user_interview_section_answer');
const Response = require('../../utils/response');
const Models = require('../../models/mysql');
const Helpers = require('../../utils/helpers');
const UserInterviewConstants = require('../../constants/user_interview');

class UserInterviewError extends Error {}

const getUserInterview = async (input, opts = {}) => {
    const language = opts.lang;

    const interview = await UserInterviewRepository.findOne(
        input,
        {
            include: [
                { model: Models.User, as: 'user' },
                {
                    model: Models.Interview,
                    as: 'interview',
                    ...(opts.isDetailed ? {
                        include: {
                            model: Models.InterviewSection,
                            as: 'interviewSections',
                            ...(opts.isDetailedWithQuestion ? {
                                include: { model: Models.InterviewSectionQuestion, as: 'interviewSectionQuestions' }
                            } : {})
                        }
                    } : {})
                },
                {
                    model: Models.UserInterviewSection,
                    as: 'interviewSections',
                    include: {
                        model: Models.UserInterviewSectionAnswer,
                        as: 'interviewSectionAnswers',
                        include: { model: Models.InterviewSectionQuestion, as: 'interviewSectionQuestion' }
                    }
                }
            ]
        }
    );
    if (!interview) {
        return Response.formatServiceReturn(false, 404, null, language.USER_INTERVIEW.NOT_FOUND);
    }

    return Response.formatServiceReturn(true, 200, interview, null);
};

const getAllUserInterviewAndCount = async (input, opts = {}) => {
    const language = opts.lang;
    const params = opts.params;

    let interviewUuid;
    if (input && 'interviewUuid' in input) {
        interviewUuid = input.interviewUuid;
        delete input.interviewUuid;
    }

    const allUserInterview = await UserInterviewRepository.findAndCountAll({
        ...input,
        ...(params.search ? {
            [Models.Op.or]: [
                {
                    '$user.full_name$': {
                        [Models.Op.like]: `%${params.search}%`
                    }
                },
                {
                    '$interview.title$': {
                        [Models.Op.like]: `%${params.search}%`
                    }
                }
            ]
        } : {})
    }, {
        include: [
            { model: Models.User, as: 'user' },
            { model: Models.Interview, as: 'interview', where: interviewUuid ? { uuid: interviewUuid } : undefined }
        ],
        attributes: {
            include: [
                [
                    Models.sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM user_interview_sections AS section
                        WHERE section.user_interview_id = UserInterview.id
                    )`),
                    'interviewSectionCount'
                ]
            ]
        },
        order: [['created_at', 'desc']],
        limit: params.limit,
        offset: Helpers.setOffset(params.page, params.limit),
        subQuery: false
    });

    if (!allUserInterview) {
        return Response.formatServiceReturn(false, 404, null, language.USER_INTERVIEW.NOT_FOUND);
    }

    return Response.formatServiceReturn(true, 200, allUserInterview, null);
};

const createUserInterview = async (input, opts = {}) => {
    const language = opts.lang;

    const interview = await InterviewRepository.findOne(
        { uuid: input.interviewUuid },
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

    let inputInterviewSections = [];
    if (input.interviewSections && Array.isArray(input.interviewSections)) {
        inputInterviewSections = input.interviewSections;
        for (let index = 0; index < inputInterviewSections.length; index++) {
            const interviewSection = interview.interviewSections.find((item) => item.uuid === inputInterviewSections[index].interviewSectionUuid);
            if (!interviewSection) {
                return Response.formatServiceReturn(false, 404, null, language.INTERVIEW_SECTION.NOT_FOUND);
            }

            if (inputInterviewSections[index].interviewSectionAnswers && Array.isArray(inputInterviewSections[index].interviewSectionAnswers)) {
                // eslint-disable-next-line max-depth
                for (let answerIndex = 0; answerIndex < inputInterviewSections[index].interviewSectionAnswers.length; answerIndex++) {
                    const interviewSectionQuestion = interviewSection.interviewSectionQuestions.find(
                        (question) => !inputInterviewSections[index].interviewSectionAnswers[answerIndex].interviewSectionQuestionUuid === question.uuid
                    );
                    // eslint-disable-next-line max-depth
                    if (!interviewSectionQuestion) {
                        return Response.formatServiceReturn(false, 404, null, language.INTERVIEW_SECTION_QUESTION.NOT_FOUND);
                    }

                    inputInterviewSections[index].interviewSectionAnswers[answerIndex] = {
                        ...inputInterviewSections[index].interviewSectionAnswers[answerIndex],
                        interviewSectionQuestionId: interviewSectionQuestion.id
                    };
                }
            }

            inputInterviewSections[index] = { ...inputInterviewSections[index], interviewSectionId: interviewSection.id };
        }
    }

    try {
        const result = await Models.sequelize.transaction(async (trx) => {
            const hasInterviewSections = input.interviewSections
                && Array.isArray(input.interviewSections)
                && !!input.interviewSections.length;
            const isSingleInterview = inputInterviewSections.length === 1;

            const userInterview = await UserInterviewRepository.create(
                {
                    userId: input.userId,
                    interviewId: interview.id,
                    productPackageId: input.interviewPackageId,
                    ...(input.language != null ? { language: input.language } : {}),
                    backgroundDescription: input.backgroundDescription,
                    ...(opts.withReview ? ({
                        ...(hasInterviewSections ? ({
                            sectionReviewStatus: UserInterviewConstants.STATUS.PENDING
                        }) : {}),
                        ...(!isSingleInterview ? ({ overallReviewStatus: UserInterviewConstants.STATUS.PENDING }) : {})
                    }) : {}),
                    ...(!opts.isRestricted ? { overallReview: input.overallReview } : {})
                },
                trx
            );
            if (!userInterview) throw new UserInterviewError(language.USER_INTERVIEW.CREATE_FAILED);

            if (hasInterviewSections) {
                const interviewSections = [];
                const pendingPromises = inputInterviewSections.map(async (item) => {
                    const hasInterviewSectionAnswers = item.interviewSectionAnswers
                        && Array.isArray(item.interviewSectionAnswers)
                        && !!item.interviewSectionAnswers.length;

                    const userInterviewSection = await UserInterviewSectionRepository.create({
                        userInterviewId: userInterview.id,
                        interviewSectionId: item.interviewSectionId,
                        ...(opts.withReview ? ({
                            reviewStatus: UserInterviewConstants.STATUS.PENDING,
                            ...(hasInterviewSectionAnswers ? ({
                                answerReviewStatus: UserInterviewConstants.STATUS.PENDING
                            }) : {})
                        }) : {}),
                        ...(!opts.isRestricted ? { review: item.review } : {})
                    }, trx);
                    if (!userInterviewSection) throw new UserInterviewError(language.USER_INTERVIEW_SECTION.CREATE_FAILED);

                    if (hasInterviewSectionAnswers) {
                        const interviewSectionAnswers = await UserInterviewSectionAnswerRepository.createMany(item.interviewSectionAnswers.map((answer) => ({
                            userInterviewSectionId: userInterviewSection.id,
                            interviewSectionQuestionId: answer.interviewSectionQuestionId,
                            answer: answer.answer,
                            ...(opts.withReview ? ({
                                reviewStatus: UserInterviewConstants.STATUS.PENDING
                            }) : {}),
                            ...(!opts.isRestricted ? { review: answer.review } : {})
                        })), trx);
                        if (!interviewSectionAnswers) throw new UserInterviewError(language.USER_INTERVIEW_SECTION_ANSWER.CREATE_FAILED);

                        userInterviewSection.interviewSectionAnswers = interviewSectionAnswers;
                    }

                    interviewSections.push(userInterviewSection);
                });

                await Promise.all(pendingPromises);

                userInterview.interviewSections = interviewSections;
            }

            return userInterview;
        });

        return Response.formatServiceReturn(true, 200, result, null);
    } catch (err) {
        if (err instanceof UserInterviewError) {
            return Response.formatServiceReturn(false, 500, null, err.message);
        }

        throw err;
    }
};

const updateUserInterview = async (input, opts = {}) => {
    const language = opts.lang;

    const userInterview = await UserInterviewRepository.findOne(
        { uuid: input.uuid, ...(input.userId ? { userId: input.userId } : {}) },
        {
            include: {
                model: Models.UserInterviewSection,
                as: 'interviewSections',
                include: {
                    model: Models.UserInterviewSectionAnswer,
                    attributes: ['id', 'uuid'],
                    as: 'interviewSectionAnswers'
                }
            }
        }
    );

    if (!userInterview) {
        return Response.formatServiceReturn(false, 404, null, language.USER_INTERVIEW.NOT_FOUND);
    }

    const interview = await InterviewRepository.findOne(
        { uuid: input.interviewUuid },
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

    let inputInterviewSections = [];
    if (input.interviewSections && Array.isArray(input.interviewSections)) {
        inputInterviewSections = input.interviewSections;
        for (let index = 0; index < inputInterviewSections.length; index++) {
            // eslint-disable-next-line no-loop-func
            const interviewSection = interview.interviewSections.find((item) => item.uuid === inputInterviewSections[index].interviewSectionUuid);
            if (!interviewSection) {
                return Response.formatServiceReturn(false, 404, null, language.INTERVIEW_SECTION.NOT_FOUND);
            }

            if (inputInterviewSections[index].interviewSectionAnswers && Array.isArray(inputInterviewSections[index].interviewSectionAnswers)) {
                // eslint-disable-next-line max-depth
                for (let answerIndex = 0; answerIndex < inputInterviewSections[index].interviewSectionAnswers.length; answerIndex++) {
                    const interviewSectionQuestion = interviewSection.interviewSectionQuestions.find(
                        // eslint-disable-next-line no-loop-func
                        (question) => !inputInterviewSections[index].interviewSectionAnswers[answerIndex].interviewSectionQuestionUuid === question.uuid
                    );
                    // eslint-disable-next-line max-depth
                    if (!interviewSectionQuestion) {
                        return Response.formatServiceReturn(false, 404, null, language.INTERVIEW_SECTION_QUESTION.NOT_FOUND);
                    }

                    inputInterviewSections[index].interviewSectionAnswers[answerIndex] = {
                        ...inputInterviewSections[index].interviewSectionAnswers[answerIndex],
                        interviewSectionQuestionId: interviewSectionQuestion.id
                    };
                }
            }

            inputInterviewSections[index] = { ...inputInterviewSections[index], interviewSectionId: interviewSection.id };
        }
    }

    try {
        const result = await Models.sequelize.transaction(async (trx) => {
            let hasInterviewSections = input.interviewSections && Array.isArray(input.interviewSections);

            if (hasInterviewSections) {
                if (userInterview.interviewSections && Array.isArray(userInterview.interviewSections)) {
                    const deletedInterviewSections = userInterview.interviewSections.filter(
                        (item) => !inputInterviewSections.find((i) => i.uuid === item.uuid)
                    );
                    if (deletedInterviewSections.length) {
                        const deleteCount = await UserInterviewSectionRepository.delete(
                            { id: deletedInterviewSections.map((item) => item.id) },
                            { force: true },
                            trx
                        );
                        // eslint-disable-next-line max-depth
                        if (!deleteCount) throw new UserInterviewError(language.USER_SECTION_ITEM.DELETE_FAILED);
                    }

                    inputInterviewSections = inputInterviewSections.map((item) => {
                        const interviewSection = userInterview.interviewSections.find((i) => i.uuid === item.uuid);
                        return ({
                            ...item,
                            ...(interviewSection && {
                                id: interviewSection.id,
                                currentInterviewSectionAnswers: interviewSection.interviewSectionAnswers
                            })
                        });
                    });
                }
            }

            hasInterviewSections = hasInterviewSections && !!inputInterviewSections.length;
            const isSingleInterview = inputInterviewSections.length === 1;

            const updatedItem = await UserInterviewRepository.update(
                {
                    interviewId: interview.id,
                    ...(input.language != null ? { language: input.language } : {}),
                    backgroundDescription: input.backgroundDescription,
                    ...(opts.withReview ? ({
                        ...(hasInterviewSections ? ({
                            sectionReviewStatus: UserInterviewConstants.STATUS.PENDING
                        }) : {}),
                        ...(!isSingleInterview ? ({ overallReviewStatus: UserInterviewConstants.STATUS.PENDING }) : {})
                    }) : {
                        ...(hasInterviewSections ? ({
                            sectionReviewStatus: UserInterviewConstants.STATUS.NEED_REVIEW
                        }) : {}),
                        ...(!isSingleInterview ? ({ overallReviewStatus: UserInterviewConstants.STATUS.NEED_REVIEW }) : {})
                    }),
                    ...(!opts.isRestricted ? { overallReview: input.overallReview } : {})
                },
                { id: userInterview.id },
                trx
            );
            if ((Array.isArray(updatedItem) && !updatedItem[0]) || !updatedItem) {
                throw new UserInterviewError(language.USER_INTERVIEW.UPDATE_FAILED);
            }

            if (hasInterviewSections) {
                const updatingInterviewSections = inputInterviewSections.map(async (item) => {
                    let hasInterviewSectionAnswers = item.interviewSectionAnswers
                        && Array.isArray(item.interviewSectionAnswers)
                        && !!item.interviewSectionAnswers.length;

                    let inputInterviewSectionAnswers = item.interviewSectionAnswers;
                    if (hasInterviewSectionAnswers) {
                        if (item.currentUserInterviewSectionAnswers && Array.isArray(item.currentUserInterviewSectionAnswers)) {
                            const deletedUserInterviewSectionAnswers = item.currentUserInterviewSectionAnswers.filter(
                                (question) => !inputInterviewSectionAnswers.find((i) => i.uuid === question.uuid)
                            );
                            if (deletedUserInterviewSectionAnswers.length) {
                                const deleteCount = await UserInterviewSectionAnswerRepository.delete(
                                    { id: deletedUserInterviewSectionAnswers.map((question) => question.id) },
                                    { force: true },
                                    trx
                                );
                                // eslint-disable-next-line max-depth
                                if (!deleteCount) throw new UserInterviewError(language.USER_INTERVIEW_SECTION_ANSWER.DELETE_FAILED);
                            }

                            inputInterviewSectionAnswers = inputInterviewSectionAnswers.map((answer) => {
                                const interviewSectionAnswer = item.currentUserInterviewSectionAnswers.find((i) => i.uuid === answer.uuid);
                                return ({
                                    ...answer,
                                    ...(interviewSectionAnswer && { id: interviewSectionAnswer.id })
                                });
                            });
                        }
                    }

                    hasInterviewSectionAnswers = hasInterviewSectionAnswers && !!inputInterviewSectionAnswers.length;

                    const updatedInterviewSection = await UserInterviewSectionRepository.createOrUpdate({
                        id: item.id,
                        userInterviewId: userInterview.id,
                        interviewSectionId: item.interviewSectionId,
                        ...(opts.withReview ? ({
                            reviewStatus: UserInterviewConstants.STATUS.PENDING,
                            ...(hasInterviewSectionAnswers ? ({
                                answerReviewStatus: UserInterviewConstants.STATUS.PENDING
                            }) : {})
                        }) : {
                            reviewStatus: UserInterviewConstants.STATUS.NEED_REVIEW,
                            ...(hasInterviewSectionAnswers ? ({
                                answerReviewStatus: UserInterviewConstants.STATUS.NEED_REVIEW
                            }) : {})
                        }),
                        ...(!opts.isRestricted ? { review: item.review } : {})
                    }, trx);
                    if ((Array.isArray(updatedInterviewSection) && !updatedInterviewSection[0]) || !updatedInterviewSection) {
                        throw new UserInterviewError(language.USER_INTERVIEW_SECTION.UPDATE_FAILED);
                    }

                    let interviewSectionId = item.id;
                    if (interviewSectionId == null && (Array.isArray(updatedInterviewSection) && updatedInterviewSection[0].id != null)) {
                        interviewSectionId = updatedInterviewSection[0].id;
                    }

                    if (hasInterviewSectionAnswers) {
                        const updatingUserInterviewSectionAnswers = inputInterviewSectionAnswers.map(async (answer) => {
                            const updatedInterviewSectionAnswer = await UserInterviewSectionAnswerRepository.createOrUpdate({
                                id: answer.id,
                                userInterviewSectionId: interviewSectionId,
                                interviewSectionQuestionId: answer.interviewSectionQuestionId,
                                answer: answer.answer,
                                ...(opts.withReview ? ({
                                    reviewStatus: UserInterviewConstants.STATUS.PENDING
                                }) : {
                                    reviewStatus: UserInterviewConstants.STATUS.NEED_REVIEW
                                }),
                                ...(!opts.isRestricted ? { review: answer.review } : {})
                            }, trx);
                            if ((Array.isArray(updatedInterviewSectionAnswer) && !updatedInterviewSectionAnswer[0]) || !updatedInterviewSectionAnswer) {
                                throw new UserInterviewError(language.USER_INTERVIEW_SECTION_ANSWER.UPDATE_FAILED);
                            }
                        });

                        await Promise.all(updatingUserInterviewSectionAnswers);

                        item.interviewSectionAnswers = inputInterviewSectionAnswers;
                    }
                });

                await Promise.all(updatingInterviewSections);

                userInterview.interviewSections = inputInterviewSections;
            }

            return userInterview;
        });

        return Response.formatServiceReturn(true, 200, result, null);
    } catch (err) {
        if (err instanceof UserInterviewError) {
            return Response.formatServiceReturn(false, 500, null, err.message);
        }

        throw err;
    }
};

const deleteUserInterview = async (input, opts = {}) => {
    const language = opts.lang;

    const interview = await UserInterviewRepository.findOne(input);

    if (!interview) {
        return Response.formatServiceReturn(false, 404, null, language.USER_INTERVIEW.NOT_FOUND);
    }

    await UserInterviewRepository.delete({ id: interview.id });

    return Response.formatServiceReturn(true, 200, null, language.USER_INTERVIEW.DELETE_SUCCESS);
};

exports.getUserInterview = getUserInterview;
exports.getAllUserInterviewAndCount = getAllUserInterviewAndCount;
exports.createUserInterview = createUserInterview;
exports.updateUserInterview = updateUserInterview;
exports.deleteUserInterview = deleteUserInterview;

module.exports = exports;
