const PlacementTestRepository = require('../../../repositories/mysql/placement-test');
const Models = require('../../../models/mysql');

exports.getMyPlacementTest = async (req, res) => {
    try {
        const userId = req.session?.user.id; // user yang login

        const score = await PlacementTestRepository.findOne({
            where: { user_id: userId },
            order: [['created_at', 'DESC']],
            include: [
                {
                    model: Models.User,
                    attributes: ['id', 'full_name', 'email']
                }
            ]
        });

        return res.status(200).json({
            data: score || null
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = exports;
