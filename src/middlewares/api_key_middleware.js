'use strict';


module.exports = async (req, res, next) => {
    try {
        const headers = req.headers || {};
        const apiKey = headers['x-api-key'] || headers['X-API-KEY'] || '';
        const message = 'API key not valid';

        if (apiKey !== process.env.TOOLS_API_KEY) {
            return res.status(401).json({ message });
        }

        return next();
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};
