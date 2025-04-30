const AccountService = require('../../../services/v1/account');

module.exports = {
    async getUserRoles(req, res) {
        try {
            // Ambil user dari token yang sudah divalidasi oleh tokenMiddleware
            // (req.user diisi oleh middleware setelah token diverifikasi)
            const token = req.token || (req.headers['authorization'] ? req.headers['authorization'].replace(/^Bearer\s/, '') : null);
            if (!token) return res.status(401).json({ message: 'No token provided' });
            const userData = await AccountService.verifyTokenAndGetUserData(token);
            // Kembalikan roles yang memang dimiliki user ini saja
            return res.status(200).json({ data: userData.roles });
        } catch (err) {
            return res.status(401).json({ message: err.message });
        }
    }
};
