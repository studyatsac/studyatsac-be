module.exports = (sequelize, DataTypes) => {
    const attributes = {
        id: {
            type: DataTypes.INTEGER().UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        uuid: {
            type: DataTypes.STRING(36),
            allowNull: false,
            defaultValue: DataTypes.UUIDV4
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        imageUrl: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        price: {
            type: DataTypes.DECIMAL(20, 2),
            allowNull: false
        },
        additionalInformation: {
            type: DataTypes.JSON,
            allowNull: true
        },
        isPrivate: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false
        }
    };

    const options = {
        timestamps: true,
        paranoid: true,
        underscored: true,
        freezeTableName: true,
        tableName: 'exam_packages'
    };

    const ExamPackage = sequelize.define('ExamPackage', attributes, options);

    ExamPackage.associate = (models) => {
        ExamPackage.hasMany(models.ExamPackageCategory, {
            sourceKey: 'id',
            foreignKey: 'exam_package_id'
        });

        ExamPackage.hasMany(models.UserPurchase, {
            sourceKey: 'id',
            foreignKey: 'exam_package_id'
        });
    };

    return ExamPackage;
};
