const ResourcesService = require('../../../services/v1/resources');
const LogUtils = require('../../../utils/logger');

exports.createResources = async (req, res) => {
    try {
        const resource = await ResourcesService.createResources(req.body);

        res.json({
            message: 'Upload and save success',
            data: resource
        });

        return res.status(200).json({ data: res, message: 'Create resource success' });
    } catch (err) {
        LogUtils.logError({
            function_name: 'admin_getListResources',
            message: err.message
        });
        return res.status(500).json({ message: 'INTERNAL_SERVER_ERROR' });
    }
};

module.exports = exports;
