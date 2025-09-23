module.exports = (sequelize, DataTypes) => {
    const attributes = {
        certificate_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        user_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false
        },
        exam_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false
        },
        certificate_code: {
            type: DataTypes.STRING,
            allowNull: false
        },
        type: {
            type: DataTypes.STRING,
            allowNull: false
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            field: 'created_at' // Pastikan nama kolom di database sesuai
        }
    };

    const options = {
        timestamps: false,
        freezeTableName: true,
        tableName: 'certificates'
    };

    const Certificate = sequelize.define('Certificate', attributes, options);

    Certificate.associate = (models) => {
        // Certificate dimiliki oleh satu User
        Certificate.belongsTo(models.User, {
            foreignKey: 'user_id',
            as: 'user'
        });

        // Certificate dimiliki oleh satu Exam
        Certificate.belongsTo(models.Exam, {
            foreignKey: 'exam_id',
            as: 'exam'
        });
    };

    return Certificate;
};
