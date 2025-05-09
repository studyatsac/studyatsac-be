const UserPurchaseRepository = require('../../../repositories/mysql/user_purchase');
const bcrypt = require('bcrypt');

exports.createUserPurchase = async (req, res) => {
    try {
        const { user_id, exam_package_id, created_at, expired_at } = req.body;

        if (!user_id || !exam_package_id) {
            return res.status(400).json({ message: 'User ID and Exam Package ID are required' });
        }

        if (!expired_at) {
            return res.status(400).json({ message: 'Expired At is required' });
        }

        // Generate UUID using bcrypt
        const salt = await bcrypt.genSalt(10);
        const uuid = await bcrypt.hash(`${user_id}-${exam_package_id}-${Date.now()}`, salt);

        // Create user purchase
        const userPurchase = await UserPurchaseRepository.create({
            uuid,
            userId: user_id,
            examPackageId: exam_package_id,
            created_at,
            expiredAt: expired_at
        });

        // Get user purchase with relations
        const userPurchaseWithRelations = await UserPurchaseRepository.findOne({ id: userPurchase.id });

        return res.status(201).json({
            message: 'User purchase created successfully',
            data: userPurchaseWithRelations
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};