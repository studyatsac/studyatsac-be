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
        externalTransactionId: {
            type: DataTypes.STRING(50),
            allowNull: true
        },
        userId: {
            type: DataTypes.INTEGER().UNSIGNED,
            allowNull: false
        },
        examPackageId: {
            type: DataTypes.INTEGER().UNSIGNED,
            allowNull: true
        },
        productPackageId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true
        },
        expiredAt: {
            type: DataTypes.DATE(),
            allowNull: false
        }
    };

    const options = {
        timestamps: true,
        paranoid: true,
        underscored: true,
        freezeTableName: true,
        tableName: 'user_purchases'
    };

    const UserPurchase = sequelize.define('UserPurchase', attributes, options);

    UserPurchase.associate = (models) => {
        UserPurchase.belongsTo(models.ExamPackage, {
            targetKey: 'id',
            foreignKey: 'exam_package_id'
        });
        UserPurchase.belongsTo(models.User, {
            targetKey: 'id',
            foreignKey: 'user_id'
        });
        UserPurchase.belongsTo(models.ProductPackage, {
            targetKey: 'id',
            foreignKey: 'product_package_id',
            as: 'productPackage'
        });
    };

    return UserPurchase;
};
