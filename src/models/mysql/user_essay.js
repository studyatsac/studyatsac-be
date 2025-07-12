const UserEssayConstants = require('../../constants/user_essay');

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
        userId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false
        },
        essayId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false
        },
        essayPackageId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true
        },
        overallReview: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        itemReviewStatus: {
            type: DataTypes.STRING(30),
            allowNull: false,
            defaultValue: UserEssayConstants.STATUS.NOT_STARTED
        },
        overallReviewStatus: {
            type: DataTypes.STRING(30),
            allowNull: false,
            defaultValue: UserEssayConstants.STATUS.NOT_STARTED
        },
        language: {
            type: DataTypes.STRING(20),
            allowNull: true
        },
        backgroundDescription: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    };

    const options = {
        timestamps: true,
        paranoid: true,
        underscored: true,
        tableName: 'user_essays'
    };

    const UserEssay = sequelize.define('UserEssay', attributes, options);

    UserEssay.associate = (models) => {
        UserEssay.belongsTo(models.User, {
            targetKey: 'id',
            foreignKey: 'user_id',
            as: 'user'
        });
        UserEssay.belongsTo(models.Essay, {
            targetKey: 'id',
            foreignKey: 'essay_id',
            as: 'essay'
        });
        UserEssay.hasMany(models.UserEssayItem, {
            sourceKey: 'id',
            foreignKey: 'user_essay_id',
            onDelete: 'CASCADE',
            as: 'essayItems'
        });
        UserEssay.belongsTo(models.EssayPackage, {
            targetKey: 'id',
            foreignKey: 'essay_package_id',
            as: 'essayPackage'
        });
    };

    return UserEssay;
};
