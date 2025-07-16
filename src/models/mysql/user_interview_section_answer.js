const UserInterviewConstants = require('../../constants/user_interview');

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
        userInterviewSectionId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false
        },
        interviewSectionQuestionId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false
        },
        status: {
            type: DataTypes.STRING(30),
            allowNull: false,
            defaultValue: UserInterviewConstants.SECTION_ANSWER_STATUS.NOT_STARTED
        },
        askedAt: {
            type: DataTypes.DATE,
            allowNull: true
        },
        answeredAt: {
            type: DataTypes.DATE,
            allowNull: true
        },
        answer: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        review: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        reviewStatus: {
            type: DataTypes.STRING(30),
            allowNull: false,
            defaultValue: UserInterviewConstants.STATUS.NOT_STARTED
        }
    };

    const options = {
        timestamps: true,
        paranoid: true,
        underscored: true,
        tableName: 'user_interview_section_answers'
    };

    const UserInterviewSectionAnswer = sequelize.define('UserInterviewSectionAnswer', attributes, options);

    UserInterviewSectionAnswer.associate = (models) => {
        UserInterviewSectionAnswer.belongsTo(models.UserInterviewSection, {
            targetKey: 'id',
            foreignKey: 'user_interview_section_id'
        });
        UserInterviewSectionAnswer.belongsTo(models.InterviewSectionQuestion, {
            targetKey: 'id',
            foreignKey: 'interview_section_question_id',
            as: 'interviewSectionQuestion'
        });
    };

    return UserInterviewSectionAnswer;
};
