module.exports = (sequelize, DataTypes) => {
    const attributes = {
        // Kolom 'id' dihapus
        uuid: {
            type: DataTypes.STRING(36),
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4
        },
        scholarship_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        open_date: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        closed_date: {
            type: DataTypes.DATEONLY,
            allowNull: false
        },
        level: {
            type: DataTypes.ENUM('D3', 'D4', 'S1', 'S2', 'S3'),
            allowNull: false
        },
        type: {
            type: DataTypes.ENUM('full_funded', 'partially_funded', 'self_funded'),
            allowNull: false
        },
        country: {
            type: DataTypes.STRING,
            allowNull: false
        },
        university: {
            type: DataTypes.STRING,
            allowNull: false
        },
        status: {
            type: DataTypes.TINYINT,
            allowNull: false,
            defaultValue: 1
        }
    };

    const options = {
        timestamps: true,
        paranoid: true,
        underscored: true,
        freezeTableName: true,
        tableName: 'scholarships'
    };

    const Scholarships = sequelize.define('Scholarships', attributes, options);

    Scholarships.associate = function (models) {
        Scholarships.hasOne(models.ScholarshipDetails, {
            foreignKey: 'scholarship_id',
            sourceKey: 'uuid', // Menentukan bahwa foreign key merujuk ke 'uuid'
            as: 'details'
        });
    };

    return Scholarships;
};
