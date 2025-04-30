const UserRepository = require('../../../repositories/mysql/user');

exports.createUser = async (req, res) => {
    try {
        const userData = req.body;
        // Validasi sederhana, sesuaikan jika ada field wajib
        if (!userData.name || !userData.email) {
            return res.status(400).json({ message: 'name and email are required' });
        }
        const created = await UserRepository.create(userData);
        return res.status(201).json({ data: created });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = exports;
