const AuthService = require('../services/v1/account');

module.exports = async (client, next) => {
    try {
        const token = client.handshake.auth.token;

        let result = null;
        try {
            result = await AuthService.verifyTokenAndGetUserData(token);
        } catch {
            return next(new Error('unauthorized'));
        }

        if (result?.password) { delete result.password; }

        client.handshake.auth.user = result;

        return next();
    } catch {
        return next(new Error('authentication_failed'));
    }
};
