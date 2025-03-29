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
        taskId: {
            type: DataTypes.INTEGER().UNSIGNED,
            allowNull: true,
            defaultValue: null
        },
        readingScore: {
            type: DataTypes.INTEGER(),
            allowNull: true,
            defaultValue: null
        },
        listeningScore: {
            type: DataTypes.INTEGER(),
            allowNull: true,
            defaultValue: null
        },
        overallScore: {
            type: DataTypes.INTEGER(),
            allowNull: false
        }
    };

    const options = {
        timestamps: true,
        paranoid: true,
        underscored: true,
        freezeTableName: true,
        tableName: 'ielts_scores'
    };

    const IeltsScore = sequelize.define('IeltsScore', attributes, options);

    return IeltsScore;
};
