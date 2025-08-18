exports.item = (data) => {
  const userReview = data.UserReview;

  const responseData = {
    uuid: userReview.uuid,
    userId: userReview.userId,
    rating: userReview.rating,
    comment: userReview.comment,
  };

  return responseData;
};

module.exports = exports;
