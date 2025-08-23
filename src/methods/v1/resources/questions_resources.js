const QuestionsResourcesService = require('../../../services/v1/resources');

exports.getResourcesByQuestion = async function (req, res) {
    try {
        const { questionId } = req.params;
        if (!questionId) {
            return res.status(400).json({ message: 'questionId is required' });
        }
        const resources = await QuestionsResourcesService.getResourcesByQuestion(questionId);
        return res.status(200).json({
            success: true,
            data: resources
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
