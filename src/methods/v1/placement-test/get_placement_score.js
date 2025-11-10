const PlacementTestRepository = require('../../../repositories/mysql/placement-test');
const Models = require('../../../models/mysql');

exports.getMyPlacementTest = async (req, res) => {
    try {
        const userId = req.session.id;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const score = await PlacementTestRepository.findOne(
            { user_id: userId },
            {
                order: [['created_at', 'DESC']],
                include: [
                    {
                        model: Models.User,
                        attributes: ['id', 'full_name', 'email']
                    }
                ]
            }
        );

        return res.status(200).json({
            data: score || null
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = exports;
