const UserPurchaseRepository = require('../../../repositories/mysql/user_purchase');

exports.updateUserPurchase = async (req, res) => {
    try {
        const id = req.params.id;
        const update_data = req.body;
        if (!id) {
            return res.status(400).json({ message: 'UserPurchase id is required' });
        }
        const user_purchase = await UserPurchaseRepository.findOne({ id });
        if (!user_purchase) {
            return res.status(404).json({ message: 'UserPurchase not found' });
        }
        await UserPurchaseRepository.update({ id }, update_data);
        const updatedUserPurchase = await UserPurchaseRepository.findOne({ id });
        return res.status(200).json({ data: updatedUserPurchase });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = exports;
