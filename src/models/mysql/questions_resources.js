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
        resource_id: {
            type: DataTypes.INTEGER().UNSIGNED,
            allowNull: false
        },
        question_id: {
            type: DataTypes.INTEGER().UNSIGNED,
            allowNull: false
        }
    };

    const options = {
        timestamps: true,
        paranoid: true,
        underscored: true,
        freezeTableName: true,
        tableName: 'questions_resources'
    };

    const QuestionResources = sequelize.define('questions_resources', attributes, options);

    QuestionResources.associate = (models) => {
        QuestionResources.belongsTo(models.Resources, {
            foreignKey: 'resource_id',
            as: 'resource'
        });
        QuestionResources.belongsTo(models.Question, {
            sourceKey: 'question_id',
            foreignKey: 'question_id'
        });
    };

    return QuestionResources;
};
