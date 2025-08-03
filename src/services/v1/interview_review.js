const Response = require('../../utils/response');
const UserInterviewRepository = require('../../repositories/mysql/user_interview');
const UserInterviewConstants = require('../../constants/user_interview');
const Models = require('../../models/mysql');
const UserInterviewSectionRepository = require('../../repositories/mysql/user_interview_section');
const UserInterviewSectionAnswerRepository = require('../../repositories/mysql/user_interview_section_answer');

class InterviewReviewError extends Error {}

const reviewInterviewReview = async (input, opts = {}) => {
    const language = opts.lang;

    const userInterview = await UserInterviewRepository.findOne(
        { uuid: input.uuid, userId: input.userId },
        {
            include: {
                model: Models.UserInterviewSection,
                as: 'interviewSections',
                include: [
                    { model: Models.InterviewSection, as: 'interviewSection' },
                    {
                        model: Models.InterviewSectionAnswer,
                        as: 'interviewSectionAnswers',
                        include: {
                            model: Models.InterviewSectionQuestion,
                            as: 'interviewSectionQuestion'
                        }
                    }
                ]
            }
        }
    );
    if (!userInterview) {
        return Response.formatServiceReturn(false, 404, null, language.USER_INTERVIEW.NOT_FOUND);
    }

    let inputInterviewSections = [];
    if (input.interviewSections && Array.isArray(input.interviewSections)) {
        inputInterviewSections = input.interviewSections;
        for (let index = 0; index < inputInterviewSections.length; index++) {
            const userInterviewSection = userInterview.interviewSections.find(
                (item) => item.uuid === inputInterviewSections[index].uuid
            );
            if (!userInterviewSection) {
                return Response.formatServiceReturn(false, 404, null, language.USER_INTERVIEW_SECTION.NOT_FOUND);
            }

            if (inputInterviewSections[index].interviewSectionAnswers && Array.isArray(inputInterviewSections[index].interviewSectionAnswers)) {
                // eslint-disable-next-line max-depth
                for (let answerIndex = 0; answerIndex < inputInterviewSections[index].interviewSectionAnswers.length; answerIndex++) {
                    const interviewSectionAnswer = userInterviewSection.interviewSectionAnswers.find(
                        (answer) => answer.uuid === inputInterviewSections[index].interviewSectionAnswers[answerIndex].uuid
                    );
                    // eslint-disable-next-line max-depth
                    if (!interviewSectionAnswer) {
                        return Response.formatServiceReturn(false, 404, null, language.USER_INTERVIEW_SECTION_ANSWER.NOT_FOUND);
                    }

                    inputInterviewSections[index].interviewSectionAnswers[answerIndex] = {
                        ...inputInterviewSections[index].interviewSectionAnswers[answerIndex],
                        id: interviewSectionAnswer.id
                    };
                }
            }

            inputInterviewSections[index] = { ...inputInterviewSections[index], id: userInterviewSection.id };
        }
    }

    if (!inputInterviewSections.length) {
        return Response.formatServiceReturn(false, 404, null, language.USER_INTERVIEW_SECTION.NOT_FOUND);
    }

    try {
        const updateResult = await Models.sequelize.transaction(async (trx) => {
            if (inputInterviewSections.length) {
                const pendingPromises = inputInterviewSections.map(async (interviewSection) => {
                    if (interviewSection.interviewSectionAnswers && Array.isArray(interviewSection.interviewSectionAnswers)) {
                        const answerPendingPromises = interviewSection.interviewSectionAnswers.map(async (answer) => {
                            const result = await UserInterviewSectionAnswerRepository.update(
                                {
                                    answer: answer.answer,
                                    reviewStatus: UserInterviewConstants.REVIEW_STATUS.QUEUED
                                },
                                { id: answer.id },
                                trx
                            );
                            if (!result) throw new InterviewReviewError(language.USER_INTERVIEW_SECTION_ANSWER.UPDATE_FAILED);
                        });

                        await Promise.all(answerPendingPromises);
                    }

                    const result = await UserInterviewSectionRepository.update(
                        {
                            reviewStatus: UserInterviewConstants.REVIEW_STATUS.QUEUED,
                            answerReviewStatus: UserInterviewConstants.REVIEW_STATUS.QUEUED
                        },
                        { id: interviewSection.id },
                        trx
                    );
                    if (!result) throw new InterviewReviewError(language.USER_INTERVIEW_SECTION.UPDATE_FAILED);
                });

                await Promise.all(pendingPromises);
            }

            const result = await UserInterviewRepository.update(
                {
                    sectionReviewStatus: UserInterviewConstants.REVIEW_STATUS.QUEUED,
                    overallReviewStatus: UserInterviewConstants.REVIEW_STATUS.QUEUED
                },
                { id: userInterview.id },
                trx
            );
            if (!result) throw new InterviewReviewError(language.USER_INTERVIEW.UPDATE_FAILED);

            return userInterview;
        });

        return Response.formatServiceReturn(true, 200, updateResult, null);
    } catch (err) {
        if (err instanceof InterviewReviewError) return Response.formatServiceReturn(false, 500, null, err.message);

        throw err;
    }
};

exports.reviewInterviewReview = reviewInterviewReview;

module.exports = exports;
