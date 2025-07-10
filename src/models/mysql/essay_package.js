module.exports = (sequelize, DataTypes) => {
    const attributes = {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        uuid: {
            type: DataTypes.UUID,
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
        additionalInformation: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        price: {
            type: DataTypes.DECIMAL(20, 2),
            allowNull: false
        },
        totalMaxAttempt: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            defaultValue: 0
        },
        defaultItemMaxAttempt: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            defaultValue: 0
        },
        paymentUrl: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        }
    };

    const options = {
        timestamps: true,
        paranoid: true,
        underscored: true,
        tableName: 'essay_packages'
    };

    const EssayPackage = sequelize.define('EssayPackage', attributes, options);

    EssayPackage.associate = (models) => {
        EssayPackage.hasMany(models.EssayPackageMapping, {
            sourceKey: 'id',
            foreignKey: 'essay_package_id',
            onDelete: 'CASCADE',
            as: 'essayPackageMappings'
        });
        EssayPackage.hasMany(models.UserPurchase, {
            sourceKey: 'id',
            foreignKey: 'essay_package_id',
            as: 'userPurchases'
        });
    };

    return EssayPackage;
};
