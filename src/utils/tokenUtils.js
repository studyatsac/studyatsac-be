const Crypto = require('crypto');

const generateResetPasswordToken = (length = 32) => {
    return Crypto.randomBytes(length).toString('hex');
};

module.exports = generateResetPasswordToken;
