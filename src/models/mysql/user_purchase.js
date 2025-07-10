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
        userId: {
            type: DataTypes.INTEGER().UNSIGNED,
            allowNull: false
        },
        examPackageId: {
            type: DataTypes.INTEGER().UNSIGNED,
            allowNull: true,
            defaultValue: null
        },
        essayPackageId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true,
            defaultValue: null
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
        UserPurchase.belongsTo(models.EssayPackage, {
            targetKey: 'id',
            foreignKey: 'essay_package_id',
            as: 'essayPackage'
        });
    };

    return UserPurchase;
};
