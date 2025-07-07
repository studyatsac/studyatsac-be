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
        userEssayId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false
        },
        essayItemId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false
        },
        answer: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        review: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        reviewStatus: {
            type: DataTypes.STRING(30),
            allowNull: false,
            defaultValue: UserEssayConstants.STATUS.NOT_STARTED
        }
    };

    const options = {
        timestamps: true,
        paranoid: true,
        underscored: true,
        tableName: 'user_essay_items'
    };

    const UserEssayItem = sequelize.define('UserEssayItem', attributes, options);

    UserEssayItem.associate = (models) => {
        UserEssayItem.belongsTo(models.UserEssay, {
            targetKey: 'id',
            foreignKey: 'user_essay_id'
        });
        UserEssayItem.belongsTo(models.EssayItem, {
            targetKey: 'id',
            foreignKey: 'essay_item_id',
            as: 'essayItem'
        });
    };

    return UserEssayItem;
};
