const UserPurchaseRepository = require('../../../repositories/mysql/user_purchase');

exports.getUserPurchaseDetail = async (req, res) => {
    try {
        const id = req.params.id;
        if (!id) {
            return res.status(400).json({ message: 'UserPurchase id is required' });
        }
        const userPurchase = await UserPurchaseRepository.findOne({ id });
        if (!userPurchase) {
            return res.status(404).json({ message: 'UserPurchase not found' });
        }
        return res.status(200).json({ data: userPurchase });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = exports;
