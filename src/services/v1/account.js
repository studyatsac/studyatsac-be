const Bcrypt = require('bcrypt');
const JWT = require('jsonwebtoken');
const UUID = require('uuid');
const Moment = require('moment');

const UserRepository = require('../../repositories/mysql/user');
const ExamPackageRepository = require('../../repositories/mysql/exam_package');
const UserPurchaseRepository = require('../../repositories/mysql/user_purchase');
const ConfigRepository = require('../../repositories/mysql/config');
const Response = require('../../utils/response');
const Config = require('../../configs/config');

const generateToken = (account) => {
    const now = Math.floor(Date.now() / 1000); // Waktu saat ini dalam detik
    const oneMonth = 30 * 24 * 60 * 60; // Satu bulan dalam detik (30 hari)
    const expiration = now + oneMonth; // Waktu kedaluwarsa

    const payload = {
        iss: Config.appName,
        sub: account.email,
        aud: 'users',
        exp: expiration,
        iat: now,
        jti: UUID.v4(),
        userId: account.uuid
    };

    const secretKey = Config.jwt.secretKey;
    const signingOptions = {
        algorithm: Config.jwt.algorithm
    };

    const token = JWT.sign(payload, secretKey, signingOptions);

    return token;
};

const insertFreeExamPackage = async (key, user) => {
    try {
        const configResult = await ConfigRepository.findOne({ key });

        if (!configResult) {
            return Response.formatServiceReturn(false, 404, null, 'Config not found');
        }

        const configValue = configResult.value;

        if (!configValue?.isConfigEnabled) {
            return Response.formatServiceReturn(false, 404, null, 'Config is disabled');
        }

        const examPackage = await ExamPackageRepository.findOne({ id: configValue?.examPackageId });

        if (!examPackage) {
            return Response.formatServiceReturn(false, 404, null, 'Config is disabled');
        }

        const userPurchasePayload = {
            userId: user.id,
            examPackageId: examPackage.id,
            expiredAt: Moment().add(configValue.expiredIn.value, 'years').format()
        };

        const userPurchase = await UserPurchaseRepository.create(userPurchasePayload);

        return Response.formatServiceReturn(true, 200, userPurchase, null);
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error(err);

        return Response.formatServiceReturn(false, 500, null, err.message);
    }
};

const register = async (input, opts = {}) => {
    const language = opts.lang;

    const emailExist = await UserRepository.findOne({ email: input.email });

    if (emailExist) {
        return Response.formatServiceReturn(false, 422, null, language.EMAIL_ALREADY_REGISTER);
    }

    const salt = await Bcrypt.genSalt(Config.saltRound);
    const password = await Bcrypt.hash(input.password, salt);
    const userAccountPayload = { email: input.email, password, fullName: input.fullName };

    const userCreated = await UserRepository.create(userAccountPayload);

    const tokenGenerated = generateToken(userCreated);

    await insertFreeExamPackage(Config.freePackage.newRegisterUser, userCreated);

    return Response.formatServiceReturn(true, 200, { token: tokenGenerated }, null);
};

const login = async (input, opts = {}) => {
    const language = opts.lang;

    const account = await UserRepository.findOne({ email: input.email });

    if (!account) {
        return Response.formatServiceReturn(false, 404, null, language.EMAIL_OR_PASSWORD_INVALID);
    }

    const compared = await Bcrypt.compare(input.password, account.password);

    if (!compared) {
        return Response.formatServiceReturn(false, 404, null, language.EMAIL_OR_PASSWORD_INVALID);
    }

    const tokenGenerated = generateToken(account);

    return Response.formatServiceReturn(true, 200, { token: tokenGenerated }, null);
};

const verifyTokenAndGetUserData = async (token) => {
    const verifyOptions = {
        algorithm: Config.jwt.algorithm
    };

    const secretKey = Config.jwt.secretKey;
    const decodedToken = JWT.verify(token, secretKey, verifyOptions);

    const account = await UserRepository.findOne({ uuid: decodedToken.userId });

    if (!account) {
        throw new Error('Authentication token not valid');
    }

    return account.toJSON();
};

const updatePassword = async (input, opts = {}) => {
    const language = opts.lang;

    const account = await UserRepository.findOne({ id: input.user.id });

    if (!account) {
        return Response.formatServiceReturn(false, 404, null, language.EMAIL_OR_PASSWORD_INVALID);
    }

    const compared = await Bcrypt.compare(input.oldPassword, account.password);

    if (!compared) {
        return Response.formatServiceReturn(false, 404, null, language.OLD_PASSWORD_NOT_MATCH);
    }

    const salt = await Bcrypt.genSalt(Config.saltRound);
    const password = await Bcrypt.hash(input.newPassword, salt);

    await UserRepository.update({ id: account.id }, { password });

    return Response.formatServiceReturn(true, 200, null, null);
};

const getProfileAccount = async (input, opts = {}) => {
    const language = opts.lang;

    const account = await UserRepository.findOneWithIeltsScore({ id: input.user.id });

    if (!account) {
        return Response.formatServiceReturn(false, 404, null, language.USER_NOT_FOUND);
    }

    return Response.formatServiceReturn(true, 200, account, null);
};

const resetPasswordToDefaultPassword = async (input, opts = {}) => {
    const language = opts.lang;

    const account = await UserRepository.findOne({ email: input.email });

    if (!account) {
        return Response.formatServiceReturn(false, 404, null, language.EMAIL_OR_PASSWORD_INVALID);
    }

    const salt = await Bcrypt.genSalt(Config.saltRound);
    const password = await Bcrypt.hash(Config.defaultUserPassword, salt);

    await UserRepository.update({ id: account.id }, { password });

    return Response.formatServiceReturn(true, 200, null, null);
};

exports.register = register;
exports.login = login;
exports.verifyTokenAndGetUserData = verifyTokenAndGetUserData;
exports.resetPasswordToDefaultPassword = resetPasswordToDefaultPassword;
exports.updatePassword = updatePassword;
exports.getProfileAccount = getProfileAccount;

module.exports = exports;
