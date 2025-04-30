const UserRepository = require('../../../repositories/mysql/user');

exports.getUserCount = async (req, res) => {
    try {
        const count = await UserRepository.countAll();
        return res.status(200).json({ total: count });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = exports;
