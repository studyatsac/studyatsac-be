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
        metadata: {
            type: DataTypes.JSON,
            allowNull: true
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    };

    const options = {
        timestamps: true,
        paranoid: true,
        underscored: true,
        tableName: 'essay_review_logs'
    };

    const EssayReviewLog = sequelize.define('EssayReviewLog', attributes, options);

    return EssayReviewLog;
};
