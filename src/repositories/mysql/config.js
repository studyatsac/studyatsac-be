const Models = require('../../models/mysql');

exports.findOne = function (where, opts = {}, trx = null) {
    return Models.Config.findOne({ where, ...opts, transaction: trx });
};

module.exports = exports;
