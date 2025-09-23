'use strict';

const AuthService = require('../services/v1/account');

const SUPPORTED_LANGUAGES = ['id', 'en'];
const DEFAULT_LANGUAGE = 'id';

module.exports = async (req, res, next) => {
    try {
        const headers = req.headers || {};
        const token = headers.authorization || headers.Authorization || '';
        const sanitizedToken = token.trim().split(' ').pop();
        let message = 'Authentication token not valid';

        const langHeader = req.headers['accept-language'] || '';

        const preferredLang = langHeader.split(',')[0].split('-')[0].toLowerCase();

        req.locale = SUPPORTED_LANGUAGES.includes(preferredLang) ? preferredLang : DEFAULT_LANGUAGE;

        if (!sanitizedToken) {
            return next();
        }

        let result = null;

        try {
            result = await AuthService.verifyTokenAndGetUserData(sanitizedToken);
        } catch (err) {
            if (err.message) {
                message = err.message;
            }

            return res.status(401).json({ message });
        }

        if (result?.password) {
            delete result.password;
        }

        req.session = result;
        return next();
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }
};
