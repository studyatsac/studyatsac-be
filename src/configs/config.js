
module.exports = Object.freeze({
    appName: process.env.APP_NAME,
    saltRound: parseInt(process.env.SALT_ROUND),
    freePackage: {
        newRegisterUser: 'new-user-free-exam-package'
    },
    jwt: {
        secretKey: process.env.SECRET_KEY_JWT,
        algorithm: process.env.JWT_ALGORITHM
    },
    paymentWebhook: {
        mayar: {
            token: process.env.MAYAR_WEB_HOOK_TOKEN
        }
    },
    defaultUserPassword: process.env.DEFAULT_USER_PASSWORD
});
