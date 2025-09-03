const setOffset = function (page, limit) {
    const pg = page ? parseInt(page) : 1;
    const lm = parseInt(limit);
    const offset = ((pg - 1) * lm);
    return offset || 0;
};

const setOrderSql = function (key, by, defaultOrder = []) {
    const order = [defaultOrder];

    const defaultKey = {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    };

    if (key && by) {
        order[0][0] = defaultKey[key] || key;
        order[0][1] = by;
    }

    return order;
};

const setOrderNoSql = function (key, by, defaultOrder = {}) {
    let order = { ...defaultOrder };
    let orderBy = by;

    if (by === 'desc') {
        orderBy = -1;
    } else if (by === 'asc') {
        orderBy = 1;
    }

    if (key && orderBy) {
        order = {};
        order[key] = by;
    }

    return order;
};

const getRandomString = function (length, str = '') {
    if (str.length === length) {
        return str;
    }

    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const id = characters.charAt(Math.floor(Math.random() * 36));

    // eslint-disable-next-line no-param-reassign
    str = `${str}${id}`;

    return getRandomString(length, str);
};

const getRandomStringV2 = (length) => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};

const convertPhoneNumberFormat = function (phoneNumber) {
    if (!phoneNumber) {
        return phoneNumber;
    }

    const prefix = phoneNumber.substr(0, 2);

    if (prefix !== '62') {
        if (prefix === '08') {
            return `62${phoneNumber.substr(1)}`;
        }

        return `62${phoneNumber}`;
    }

    return phoneNumber;
};

const sanitizePhoneNumber = (phoneNumber) => {
    if (!phoneNumber) {
        return null;
    }

    if (phoneNumber.indexOf('0') === 0) {
        return `${phoneNumber.replace('0', '')}`;
    }

    if (phoneNumber.indexOf('62') === 0) {
        return phoneNumber.replace('62', '');
    }

    if (phoneNumber.indexOf('+62') === 0) {
        return phoneNumber.replace('+62', '');
    }

    return phoneNumber;
};

exports.setOffset = setOffset;
exports.setOrderSql = setOrderSql;
exports.setOrderNoSql = setOrderNoSql;
exports.getRandomString = getRandomString;
exports.convertPhoneNumberFormat = convertPhoneNumberFormat;
exports.sanitizePhoneNumber = sanitizePhoneNumber;
exports.getRandomStringV2 = getRandomStringV2;
