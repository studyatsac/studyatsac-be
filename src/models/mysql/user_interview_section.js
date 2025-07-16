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
        userInterviewId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false
        },
        interviewSectionId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false
        },
        status: {
            type: DataTypes.STRING(30),
            allowNull: false,
            defaultValue: UserInterviewConstants.STATUS.NOT_STARTED
        },
        startedAt: {
            type: DataTypes.DATE,
            allowNull: true
        },
        completedAt: {
            type: DataTypes.DATE,
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
        tableName: 'user_interview_sections'
    };

    const UserInterviewSection = sequelize.define('UserInterviewSection', attributes, options);

    UserInterviewSection.associate = (models) => {
        UserInterviewSection.belongsTo(models.UserInterview, {
            targetKey: 'id',
            foreignKey: 'user_interview_id'
        });
        UserInterviewSection.belongsTo(models.InterviewSection, {
            targetKey: 'id',
            foreignKey: 'interview_section_id',
            as: 'interviewSection'
        });
        UserInterviewSection.hasMany(models.UserInterviewSectionAnswer, {
            sourceKey: 'id',
            foreignKey: 'user_interview_section_id',
            onDelete: 'CASCADE',
            as: 'interviewSectionAnswers'
        });
    };

    return UserInterviewSection;
};
