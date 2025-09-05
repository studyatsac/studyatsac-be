const ResourcesService = require('../../../services/v1/resources');
const LogUtils = require('../../../utils/logger');

exports.createResources = async (req, res) => {
    try {
        // const resource = await ResourcesService.createResources(req.body);

        const input = {
            ...req.body,
            resources: req.file
        };

        const resource = await ResourcesService.createResources(input);

        return res.status(200).json({
            message: 'Create resource success',
            data: resource
        });
    } catch (err) {
        LogUtils.logError({
            function_name: 'Admin_CreateResources',
            message: err.message
        });

        return res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
    }
};

module.exports = exports;
