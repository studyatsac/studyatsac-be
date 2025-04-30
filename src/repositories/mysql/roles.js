const Models = require('../../models/mysql');

exports.findAll = function (opts = {}, trx = null) {
    return Models.Role.findAll({ ...opts, transaction: trx });
};

module.exports = exports;
