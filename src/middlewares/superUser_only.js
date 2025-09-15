const RoleUserRepository = require('../repositories/mysql/role_users');

module.exports = async function (req, res, next) {
    try {
        const userId = req.session && req.session.id;
        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized: No user id' });
        }
        const isAdmin = await RoleUserRepository.userHasRole(userId, 'super-user');
        if (isAdmin) {
            return next();
        }
        return res.status(403).json({ message: 'Forbidden: Admin only' });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};
