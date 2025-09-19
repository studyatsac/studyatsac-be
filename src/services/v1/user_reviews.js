const UserReviews = require('../../repositories/mysql/user_reviews');
const Response = require('../../utils/response');

const createUserReview = async (input, opts = {}) => {
    const language = opts.lang;

    const userReview = await UserReviews.create({
        userId: input.user.id,
        rating: input.rating,
        comment: input.comment
    });
    if (!userReview) {
        return Response.formatServiceReturn(
            false,
            500,
            null,
            language.USER_REVIEW.CREATE_FAILED
        );
    }

    return Response.formatServiceReturn(true, 200, userReview, null);
};

exports.createUserReview = createUserReview;
module.exports = exports;
