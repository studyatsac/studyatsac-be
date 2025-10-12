module.exports = (sequelize, DataTypes) => {
    const attributes = {
        // Kolom 'id' dihapus
        uuid: {
            type: DataTypes.STRING(36),
            primaryKey: true,
            allowNull: false,
            defaultValue: DataTypes.UUIDV4
        },
        scholarship_id: {
            type: DataTypes.STRING(36), // Tipe data diubah menjadi STRING(36)
            allowNull: false,
            references: {
                model: 'scholarships',
                key: 'uuid' // Referensi diubah ke kolom 'uuid'
            }
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        requirement: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        benefit: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    };

    const options = {
        timestamps: true,
        paranoid: true,
        underscored: true,
        freezeTableName: true,
        tableName: 'scholarship_details'
    };

    const ScholarshipDetails = sequelize.define('ScholarshipDetails', attributes, options);

    ScholarshipDetails.associate = function (models) {
        ScholarshipDetails.belongsTo(models.Scholarships, {
            foreignKey: 'scholarship_id',
            targetKey: 'uuid', // Menentukan bahwa foreign key merujuk ke 'uuid'
            as: 'scholarship'
        });
    };

    return ScholarshipDetails;
};
