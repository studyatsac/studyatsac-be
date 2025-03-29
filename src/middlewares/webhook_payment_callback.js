'use strict';

const Config = require('../configs/config');

module.exports = async (req, res, next) => {
    try {
        const headers = req.headers || {};
        const callbackToken = headers['x-callback-token'] || headers['X-CALLBACK-TOKEN'] || '';
        const message = 'API key not valid';

        const pgName = req.params.pg;
        const paymentWebhook = Config.paymentWebhook[pgName];

        if (paymentWebhook?.token !== callbackToken) {
            return res.status(403).json({ message });
        }

        return next();
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};
