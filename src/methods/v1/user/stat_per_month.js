const { Op, Sequelize } = require('sequelize');
const Models = require('../../../models/mysql');

const monthNames = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
];

exports.getUserStatPerMonth = async (req, res) => {
  try {
    // Ambil tahun dari query, default tahun sekarang
    const year = parseInt(req.query.year) || new Date().getFullYear();
    const users = await Models.User.findAll({
      attributes: [
        [Sequelize.fn('MONTH', Sequelize.col('created_at')), 'month'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'users']
      ],
      where: Sequelize.where(
        Sequelize.fn('YEAR', Sequelize.col('created_at')),
        year
      ),
      group: [Sequelize.fn('MONTH', Sequelize.col('created_at'))],
      order: [[Sequelize.fn('MONTH', Sequelize.col('created_at')), 'ASC']]
    });

    // Format hasil agar sesuai contoh
    const result = [];
    let usersByMonth = {};
    users.forEach(row => {
      usersByMonth[row.get('month')] = parseInt(row.get('users'));
    });
    for (let i = 1; i <= 12; i++) {
      result.push({
        month: monthNames[i - 1],
        users: usersByMonth[i] || 0
      });
    }
    return res.status(200).json(result);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports = exports;
