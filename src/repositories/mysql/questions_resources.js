const Models = require('../../models/mysql'); // Sesuaikan path Models kamu

exports.findResourcesByQuestion = function (questionId, opts = {}, trx = null) {
    return Models.ResourcesQuestion.findAll({
        include: [
            {
                model: Models.ResourcesQuestion,
                where: { question_id: questionId },
                attributes: [] // karena kita cuma butuh data resource saja
            }
        ],
        ...opts,
        transaction: trx
    });
};

module.exports = exports;
