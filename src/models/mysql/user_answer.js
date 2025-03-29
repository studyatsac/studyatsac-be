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
        userExamId: {
            type: DataTypes.INTEGER().UNSIGNED,
            allowNull: false
        },
        questionId: {
            type: DataTypes.INTEGER().UNSIGNED,
            allowNull: false
        },
        answer: {
            type: DataTypes.STRING(10),
            allowNull: false
        },
        isCorrect: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        }
    };

    const options = {
        timestamps: true,
        paranoid: true,
        underscored: true,
        freezeTableName: true,
        tableName: 'user_answers'
    };

    const UserAnswer = sequelize.define('UserAnswer', attributes, options);

    UserAnswer.associate = (models) => {
        UserAnswer.belongsTo(models.Question, {
            targetKey: 'id',
            foreignKey: 'question_id'
        });
    };

    return UserAnswer;
};
