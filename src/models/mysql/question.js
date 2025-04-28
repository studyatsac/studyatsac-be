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
        examId: {
            type: DataTypes.INTEGER().UNSIGNED,
            allowNull: false
        },
        questionNumber: {
            type: DataTypes.INTEGER().UNSIGNED,
            allowNull: false
        },
        question: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        answerOption: {
            type: DataTypes.JSON,
            allowNull: false
        },
        correctAnswer: {
            type: DataTypes.STRING(10),
            allowNull: false
        },
        explanation: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        score: {
            type: DataTypes.INTEGER().UNSIGNED,
            allowNull: true
        },
        resource_id: {
            type: DataTypes.INTEGER().UNSIGNED,
            allowNull: true
        },
        section_id: {
            type: DataTypes.INTEGER().UNSIGNED,
            allowNull: true
        }
    };

    const options = {
        timestamps: true,
        paranoid: true,
        underscored: true,
        freezeTableName: true,
        tableName: 'questions'
    };

    const Question = sequelize.define('Question', attributes, options);

    Question.associate = (models) => {
        Question.hasOne(models.UserAnswer, {
            sourceKey: 'id',
            foreignKey: 'question_id'
        });
        Question.belongsTo(models.Section, {
            foreignKey: 'section_id',
            as: 'section',
        });
        Question.belongsTo(models.Resources, {
            foreignKey: 'resource_id',
            as: 'resource',
        });
    };


    return Question;
};
