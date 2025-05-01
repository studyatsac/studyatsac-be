const UserPurchaseRepository = require('../../../repositories/mysql/user_purchase');

exports.deleteUserPurchase = async (req, res) => {
    try {
        const id = req.params.id;
        if (!id) {
            return res.status(400).json({ message: 'UserPurchase id is required' });
        }
        const userPurchase = await UserPurchaseRepository.findOne({ id });
        if (!userPurchase) {
            return res.status(404).json({ message: 'UserPurchase not found' });
        }
        await UserPurchaseRepository.delete({ id });
        return res.status(200).json({ message: 'UserPurchase deleted successfully' });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = exports;
