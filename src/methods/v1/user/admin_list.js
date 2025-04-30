const UserRepository = require('../../../repositories/mysql/user');

exports.getListUser = async (req, res) => {
    try {
        // Ambil query pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        // Query data user dan total count
        const { rows, count } = await UserRepository.findAndCountAll({}, { offset, limit });

        return res.status(200).json({
            data: rows,
            meta: {
                page,
                limit,
                totalData: count,
                totalPage: Math.ceil(count / limit)
            }
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = exports;
