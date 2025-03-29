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
        examId: {
            type: DataTypes.INTEGER().UNSIGNED,
            allowNull: false
        },
        startDate: {
            type: DataTypes.DATE(),
            allowNull: false
        },
        endDate: {
            type: DataTypes.DATE(),
            allowNull: true
        },
        totalQuestion: {
            type: DataTypes.INTEGER(),
            allowNull: false
        },
        totalCorrectAnswer: {
            type: DataTypes.INTEGER(),
            allowNull: true
        },
        totalWrongAnswer: {
            type: DataTypes.INTEGER(),
            allowNull: true
        },
        totalScore: {
            type: DataTypes.INTEGER(),
            allowNull: true
        }
    };

    const options = {
        timestamps: true,
        paranoid: true,
        underscored: true,
        freezeTableName: true,
        tableName: 'user_exams'
    };

    const UserExam = sequelize.define('UserExam', attributes, options);

    return UserExam;
};
