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
        type: {
            type: DataTypes.STRING(30),
            allowNull: true
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
        tableName: 'product_packages'
    };

    const ProductPackage = sequelize.define('ProductPackage', attributes, options);

    ProductPackage.associate = (models) => {
        ProductPackage.hasMany(models.ProductPackageMapping, {
            sourceKey: 'id',
            foreignKey: 'product_package_id',
            onDelete: 'CASCADE',
            as: 'productPackageMappings'
        });
        ProductPackage.hasMany(models.UserPurchase, {
            sourceKey: 'id',
            foreignKey: 'product_package_id',
            as: 'userPurchases'
        });
        ProductPackage.hasMany(models.UserEssay, {
            sourceKey: 'id',
            foreignKey: 'product_package_id',
            as: 'userEssays'
        });
        ProductPackage.hasOne(models.Product, {
            sourceKey: 'id',
            foreignKey: 'product_package_id',
            onDelete: 'CASCADE',
            as: 'product'
        });
    };

    return ProductPackage;
};
