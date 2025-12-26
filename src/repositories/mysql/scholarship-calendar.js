''`javascript
const Models = require('../../models/mysql');

exports.findByMonth = function (month, year, filters = {}, opts = {}, trx = null) {
    const { Op } = require('sequelize');
    
    // Create date range for the specified month
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);
    
    const whereClause = {
        ...filters,
        [Op.or]: [
            // Beasiswa yang dibuka di bulan ini
            {
                open_date: {
                    [Op.between]: [startOfMonth, endOfMonth]
                }
            },
            // Beasiswa yang ditutup di bulan ini
            {
                closed_date: {
                    [Op.between]: [startOfMonth, endOfMonth]
                }
            },
            // Beasiswa yang sedang berjalan di bulan ini (dibuka sebelumnya, tutup setelahnya)
            {
                [Op.and]: [
                    { open_date: { [Op.lte]: endOfMonth } },
                    { closed_date: { [Op.gte]: startOfMonth } }
                ]
            }
        ]
    };
    
    return Models.Scholarships.findAll({
        where: whereClause,
        include: [{
            model: Models.ScholarshipDetails,
            as: 'details'
        }],
        ...opts,
        transaction: trx
    });
};

module.exports = exports;
```;
