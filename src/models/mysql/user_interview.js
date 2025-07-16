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
        userId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false
        },
        interviewId: {
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
        overallReview: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        overallReviewStatus: {
            type: DataTypes.STRING(30),
            allowNull: false,
            defaultValue: UserInterviewConstants.STATUS.NOT_STARTED
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
        tableName: 'user_interviews'
    };

    const UserInterview = sequelize.define('UserInterview', attributes, options);

    UserInterview.associate = (models) => {
        UserInterview.belongsTo(models.User, {
            targetKey: 'id',
            foreignKey: 'user_id',
            as: 'user'
        });
        UserInterview.belongsTo(models.Interview, {
            targetKey: 'id',
            foreignKey: 'interview_id',
            as: 'interview'
        });
        UserInterview.hasMany(models.UserInterviewSection, {
            sourceKey: 'id',
            foreignKey: 'user_interview_id',
            onDelete: 'CASCADE',
            as: 'interviewSections'
        });
    };

    return UserInterview;
};
