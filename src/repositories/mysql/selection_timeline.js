const Models = require('../../models/mysql');

exports.findAll = function (where, opts = {}, trx = null) {
    return Models.SelectionTimeline.findAll({ where, ...opts, transaction: trx });
};

module.exports = exports;
