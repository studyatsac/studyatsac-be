const Models = require('../../models/mysql'); // Sesuaikan path Models kamu

exports.findResources = function (questionId, opts = {}, trx = null) {
    return Models.Resources.findAll({
        include: [
            {
                model: Models.Resources,
                where: { question_id: questionId },
                attributes: [], // karena kita cuma butuh data resource saja
      },
    ],
    ...opts,
    transaction: trx,
  });
};

module.exports = exports;
