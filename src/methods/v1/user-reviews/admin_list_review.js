const UserReviews = require("../../../repositories/mysql/user_reviews");
const Models = require("../../../models/mysql");
const Language = require("../../../languages");
const LogUtils = require("../../../utils/logger");
const { Op } = require("sequelize");

exports.getListUserReview = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const lang = Language.getLanguage(req.locale);

    // Validasi sederhana
    const pageInt = parseInt(page, 10) || 1;
    const limitInt = parseInt(limit, 10) || 10;
    const offset = (pageInt - 1) * limitInt;

    // Ambil orderBy dan order langsung dari req.query tanpa validasi
    const orderBy = req.query.orderBy || "created_at";
    const order = req.query.order || "desc";

    // Buat where clause untuk search
    const whereClause = {};
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { comment: { [Op.like]: `%${search}%` } },
      ];
    }

    const optionsClause = {
      where: whereClause,
      order: [[orderBy, order]],
      limit: limitInt,
      offset: offset,
      include: [
        {
          model: Models.User,
          attributes: [
            "id",
            "full_name",
            "email",
            "institution_name",
            "faculty",
            "nip",
          ],
        },
      ],
    };

    const review = await UserReviews.findAndCountAll(
      whereClause,
      optionsClause
    );
    const data = { rows: review.rows, count: review.count };

    return res.status(200).json({
      data: data.rows,
      meta: {
        page: pageInt,
        limit: limitInt,
        totalData: data.count,
        totalPage: Math.ceil(data.count / limitInt),
      },
    });
  } catch (err) {
    LogUtils.loggingError({
      functionName: "admin_getReviewList",
      message: err.message,
    });
    return res.status(500).json({ message: "INTERNAL_SERVER_ERROR" });
  }
};

module.exports = exports;
