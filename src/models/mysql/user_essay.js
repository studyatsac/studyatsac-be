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
        overallReview: {
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
            foreignKey: 'user_id'
        });
        UserEssay.belongsTo(models.Essay, {
            targetKey: 'id',
            foreignKey: 'essay_id'
        });
        UserEssay.hasMany(models.UserEssayItem, {
            sourceKey: 'id',
            foreignKey: 'user_essay_id',
            onDelete: 'CASCADE',
            as: 'userEssayItems'
        });
    };

    return UserEssay;
};
