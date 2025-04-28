const Models = require('../../models/mysql');

exports.findSections = function (questionId, opts = {}, trx = null) {
    // Mirip dengan resources.js, ambil section yang terkait dengan question tertentu
    return Models.Section.findAll({
        include: [
            {
                model: Models.Question,
                as: 'questions', // gunakan alias jika ada di model
                where: { id: questionId },
                attributes: [],
                required: true
            }
        ],
        ...opts,
        transaction: trx,
    });
};

module.exports = exports;
