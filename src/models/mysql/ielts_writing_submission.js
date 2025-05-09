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
        taskType: {
            type: DataTypes.STRING(20),
            defaultValue: null,
            allowNull: true
        },
        topic: {
            type: DataTypes.STRING(100),
            defaultValue: null,
            allowNull: true
        },
        writingText: {
            type: DataTypes.STRING,
            allowNull: false
        },
        score: {
            type: DataTypes.INTEGER(),
            allowNull: true
        },
        taskId: {
            type: DataTypes.INTEGER().UNSIGNED,
            allowNull: true,
            defaultValue: null
        }
    };

    const options = {
        timestamps: true,
        paranoid: true,
        underscored: true,
        freezeTableName: true,
        tableName: 'ielts_writing_submissions'
    };

    const IeltsWritingSubmission = sequelize.define('IeltsWritingSubmission', attributes, options);

    IeltsWritingSubmission.associate = (models) => {
        IeltsWritingSubmission.belongsTo(models.User, {
            targetKey: 'id',
            foreignKey: 'user_id'
        });
    };

    return IeltsWritingSubmission;
};
