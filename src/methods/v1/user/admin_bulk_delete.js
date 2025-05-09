const UserRepository = require('../../../repositories/mysql/user');

exports.bulkDeleteUsers = async (req, res) => {
    try {
        const user_ids = req.body.user_ids;
        if (!Array.isArray(user_ids) || user_ids.length === 0) {
            return res.status(400).json({ message: 'user_ids array is required' });
        }
        const deleted = await UserRepository.destroy({ where: { id: user_ids } });
        return res.status(200).json({ deleted_count: deleted });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = exports;
