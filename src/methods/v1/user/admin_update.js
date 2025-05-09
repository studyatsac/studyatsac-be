const { where } = require('sequelize');
const UserRepository = require('../../../repositories/mysql/user');
const bcrypt = require('bcrypt');



exports.updateUser = async (req, res) => {
    try {
        const id = req.params.id;
        let update_data = req.body;

        if (!id) {
            return res.status(400).json({ message: 'User id is required' });
        }

        // Cek apakah user ada
        const user = await UserRepository.findOne({ id });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Jika ada password, hash dulu
        if (update_data.password !== undefined && update_data.password !== "") {
            const salt = await bcrypt.genSalt(10);
            update_data.password = await bcrypt.hash(update_data.password, salt);
        } else {
            // Jika password kosong/hanya string kosong, jangan update password
            delete update_data.password;
        }

        const [updated] = await UserRepository.update({ id }, update_data);
        if (updated) {
            const updatedUser = await UserRepository.findOne({ id });
            return res.status(200).json({ data: updatedUser });
        } else {
            return res.status(400).json({ message: 'Nothing to update' });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = exports;
