const UserRepository = require('../../../repositories/mysql/user');

exports.deleteUser = async (req, res) => {
    try {
        const id = req.params.id;
        if (!id) {
            return res.status(400).json({ message: 'User id is required' });
        }
        const user = await UserRepository.findOne({ id });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        await UserRepository.delete({ id });
        return res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = exports;
