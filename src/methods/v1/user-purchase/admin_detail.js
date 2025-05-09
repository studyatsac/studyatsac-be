const UserPurchaseRepository = require('../../../repositories/mysql/user_purchase');
const Models = require('../../../models/mysql');
const { Op } = require('sequelize');

exports.getUserPurchaseDetail = async (req, res) => {
    try {
        const id = req.params.id;
        if (!id) {
            return res.status(400).json({ message: 'UserPurchase id is required' });
        }

        const userPurchase = await Models.UserPurchase.findOne({
            where: { id },
            include: [
                {
                    model: Models.User,
                    attributes: ['id', 'full_name', 'email', 'institution_name', 'faculty', 'nip']
                },
                {
                    model: Models.ExamPackage,
                    attributes: ['id', 'title', 'description', 'price', 'image_url', 'is_private']
                }
            ]
        });

        if (!userPurchase) {
            return res.status(404).json({ message: 'UserPurchase not found' });
        }

        // If expired_at is null, set it to 1 year from created_at
        if (!userPurchase.expired_at) {
            const oneYearFromCreated = new Date(new Date(userPurchase.created_at).setFullYear(new Date(userPurchase.created_at).getFullYear() + 1));
            await Models.UserPurchase.update(
                { expired_at: oneYearFromCreated },
                { where: { id } }
            );
            userPurchase.expired_at = oneYearFromCreated;
        }

        return res.status(200).json({ 
            data: {
                id: userPurchase.id,
                uuid: userPurchase.uuid,
                user_id: userPurchase.user_id,
                exam_package_id: userPurchase.exam_package_id,
                created_at: userPurchase.created_at,
                expired_at: userPurchase.expired_at,
                user: userPurchase.User,
                exam_package: userPurchase.ExamPackage
            }
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = exports;
