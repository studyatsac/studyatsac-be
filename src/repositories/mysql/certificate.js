const Models = require('../../models/mysql');

exports.create = function (payload, trx = null) {
    return Models.Certificate.create(payload, { transaction: trx });
};

exports.findAllByUserID = function (userId, trx = null) {
    return Models.Certificate.findAll({
        where: { user_id: userId },
        transaction: trx
    });
};

exports.findOneById = function (certificateId, trx = null) {
    return Models.Certificate.findOne({
        where: { certificate_id: certificateId },
        include: [
            { model: Models.User, as: 'user' },
            { model: Models.Exam, as: 'exam' }
        ],
        transaction: trx
    });
};

exports.findAllAndCount = function (where, opts = {}, trx = null) {
    return Models.Certificate.findAndCountAll({ where, ...opts, transaction: trx });
};

exports.delete = function (where, trx = null) {
    return Models.Certificate.destroy({ where, transaction: trx });
};

exports.findOne = function (where, opts = {}, trx = null) {
    return Models.Certificate.findOne({ where, ...opts, transaction: trx });
};

module.exports = exports;
