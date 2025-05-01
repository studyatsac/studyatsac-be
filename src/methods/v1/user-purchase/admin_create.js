const UserPurchaseRepository = require('../../../repositories/mysql/user_purchase');

exports.createUserPurchase = async (req, res) => {
    try {
        const createData = req.body;
        if (!createData.user_id || !createData.exam_package_id) {
            return res.status(400).json({ message: 'user_id and exam_package_id are required' });
        }
        const userPurchase = await UserPurchaseRepository.create(createData);
        return res.status(201).json({ data: userPurchase });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = exports;
