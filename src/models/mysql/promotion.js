module.exports = (sequelize, DataTypes) => {
    const attributes = {
        id: {
            type: DataTypes.BIGINT.UNSIGNED, // Menggunakan BIGINT.UNSIGNED untuk id
            autoIncrement: true,
            allowNull: false
        },
        uuid: {
            type: DataTypes.STRING(36), // UUID yang umumnya berbentuk string 36 karakter
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4
        },
        promo_name: {
            type: DataTypes.STRING, // varchar tanpa batasan, defaultnya 255
            allowNull: false
        },
        poster_link: {
            type: DataTypes.STRING, // varchar tanpa batasan
            allowNull: true // Asumsi ini bisa null jika tidak ada poster
        },
        link_promo: {
            type: DataTypes.STRING, // Menggunakan STRING untuk link URL
            allowNull: false
        },
        start_date: {
            type: DataTypes.DATEONLY, // Menggunakan DATEONLY untuk menyimpan tanggal saja
            allowNull: false
        },
        end_date: {
            type: DataTypes.DATEONLY, // Menggunakan DATEONLY
            allowNull: false
        }
    };

    const options = {
        timestamps: true,
        paranoid: true, // Untuk soft delete
        underscored: true, // Untuk menggunakan snake_case
        freezeTableName: true, // Agar nama tabel tidak diubah menjadi jamak oleh Sequelize
        tableName: 'promos' // Nama tabel yang sesuai dengan skema
    };

    const Promos = sequelize.define('Promos', attributes, options);

    return Promos;
};
