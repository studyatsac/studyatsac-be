const UserRepository = require('../../../repositories/mysql/user');

exports.bulkDeleteUsers = async (req, res) => {
    try {
        const userIds = req.body.userIds;
        if (!Array.isArray(userIds) || userIds.length === 0) {
            return res.status(400).json({ message: 'userIds array is required' });
        }
        const deleted = await UserRepository.destroy({ where: { id: userIds } });
        return res.status(200).json({ deletedCount: deleted });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = exports;
