const UserPurchaseRepository = require('../../../repositories/mysql/user_purchase');

exports.updateUserPurchase = async (req, res) => {
    try {
        const id = req.params.id;
        const updateData = req.body;
        if (!id) {
            return res.status(400).json({ message: 'UserPurchase id is required' });
        }
        const userPurchase = await UserPurchaseRepository.findOne({ id });
        if (!userPurchase) {
            return res.status(404).json({ message: 'UserPurchase not found' });
        }
        await UserPurchaseRepository.update({ id }, updateData);
        const updatedUserPurchase = await UserPurchaseRepository.findOne({ id });
        return res.status(200).json({ data: updatedUserPurchase });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = exports;
