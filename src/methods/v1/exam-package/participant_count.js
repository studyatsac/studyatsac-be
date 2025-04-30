const UserPurchaseRepository = require('../../../repositories/mysql/user_purchase');
const ExamPackageRepository = require('../../../repositories/mysql/exam_package');

exports.getParticipantCount = async (req, res) => {
    try {
        const { examPackageId } = req.query;
        if (!examPackageId) {
            return res.status(400).json({ message: 'examPackageId is required' });
        }
        const examPackage = await ExamPackageRepository.findOne({ id: examPackageId });
        if (!examPackage) {
            return res.status(404).json({ message: 'Exam package not found' });
        }
        const count = await UserPurchaseRepository.countByExamPackageId(examPackageId);
        return res.status(200).json({
            total: count,
            title: examPackage.title
        });
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};

module.exports = exports;
