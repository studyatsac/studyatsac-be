const Response = require('../../utils/response');
const UserInterviewRepository = require('../../repositories/mysql/user_interview');
const UserInterviewConstants = require('../../constants/user_interview');
const Models = require('../../models/mysql');
const UserInterviewSectionRepository = require('../../repositories/mysql/user_interview_section');
const UserInterviewSectionAnswerRepository = require('../../repositories/mysql/user_interview_section_answer');
const Queues = require('../../queues/bullmq');
const InterviewReviewConstants = require('../../constants/interview_review');
const InterviewRepository = require('../../repositories/mysql/interview');

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
                        model: Models.UserInterviewSectionAnswer,
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

    const interview = await InterviewRepository.findOne(
        { id: userInterview.interviewId },
        { include: { model: Models.InterviewSection, as: 'interviewSections' } }
    );
    if (!interview) {
        return Response.formatServiceReturn(false, 404, null, language.INTERVIEW.NOT_FOUND);
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

    let job;
    try {
        await Models.sequelize.transaction(async (trx) => {
            let shouldUpdate = userInterview.overallReviewStatus === UserInterviewConstants.REVIEW_STATUS.NOT_STARTED;
            shouldUpdate = shouldUpdate
                && (inputInterviewSections.length + (userInterview.interviewSections?.length ?? 0) === interview.interviewSections.length);
            let payload = {};
            if (shouldUpdate) payload = { overallReviewStatus: UserInterviewConstants.REVIEW_STATUS.QUEUED };

            if (inputInterviewSections.length) {
                const pendingPromises = inputInterviewSections.map(async (interviewSection) => {
                    let shouldUpdateSection = false;
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
                            if ((Array.isArray(result) && !result[0]) || !result) {
                                throw new InterviewReviewError(language.USER_INTERVIEW_SECTION_ANSWER.UPDATE_FAILED);
                            }
                        });

                        await Promise.all(answerPendingPromises);

                        shouldUpdateSection = true;
                    }

                    if (shouldUpdateSection) {
                        const result = await UserInterviewSectionRepository.update(
                            {
                                reviewStatus: UserInterviewConstants.REVIEW_STATUS.QUEUED,
                                answerReviewStatus: UserInterviewConstants.REVIEW_STATUS.QUEUED
                            },
                            { id: interviewSection.id },
                            trx
                        );
                        if ((Array.isArray(result) && !result[0]) || !result) {
                            throw new InterviewReviewError(language.USER_INTERVIEW_SECTION.UPDATE_FAILED);
                        }
                    }

                    return shouldUpdateSection;
                });

                const results = await Promise.all(pendingPromises);

                if (results.some((item) => !!item)) {
                    shouldUpdate = true;
                    payload = {
                        ...payload,
                        sectionReviewStatus: UserInterviewConstants.REVIEW_STATUS.QUEUED
                    };
                }
            }

            if (shouldUpdate) {
                const result = await UserInterviewRepository.update(
                    payload,
                    { id: userInterview.id },
                    trx
                );
                if ((Array.isArray(result) && !result[0]) || !result) {
                    throw new InterviewReviewError(language.USER_INTERVIEW.UPDATE_FAILED);
                }

                job = await Queues.InterviewReviewEntry.add(
                    InterviewReviewConstants.JOB_NAME.ENTRY,
                    { userInterviewId: userInterview.id },
                    { delay: InterviewReviewConstants.JOB_DELAY }
                );
            }
        });

        if (job && (await job.isDelayed())) await job.changeDelay(0);

        return Response.formatServiceReturn(true, 200, userInterview, null);
    } catch (err) {
        if (job) await job.remove();

        if (err instanceof InterviewReviewError) {
            return Response.formatServiceReturn(false, 500, null, err.message);
        }

        throw err;
    }
};

exports.reviewInterviewReview = reviewInterviewReview;

module.exports = exports;
