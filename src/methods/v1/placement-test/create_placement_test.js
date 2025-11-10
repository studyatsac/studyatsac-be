const { v4: uuidv4 } = require('uuid');
const PlacementTestRepository = require('../../../repositories/mysql/placement-test');

exports.postPlacementTest = async (req, res) => {
    try {
        const userId = req.session?.id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized: user not found in token'
            });
        }
        const { score, test_name } = req.body;

        if (!test_name) {
            return res.status(400).json({
                success: false,
                message: 'test_name is required'
            });
        }

        if (score === undefined || score === null) {
            return res.status(400).json({
                success: false,
                message: 'score is required'
            });
        }

        const newRecord = await PlacementTestRepository.create({
            uuid: uuidv4(),
            user_id: userId,
            test_name,
            score,
            created_at: new Date()
        });

        return res.status(201).json({
            success: true,
            message: 'Placement test saved successfully',
            data: newRecord
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

module.exports = exports;
