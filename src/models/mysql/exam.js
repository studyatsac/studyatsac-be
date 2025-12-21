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
        title: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        numberOfQuestion: {
            type: DataTypes.INTEGER().UNSIGNED,
            allowNull: false
        },
        duration: {
            type: DataTypes.INTEGER().UNSIGNED,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        categoryId: {
            type: DataTypes.INTEGER().UNSIGNED,
            allowNull: false
        },
        gradeRules: {
            type: DataTypes.JSON,
            allowNull: true
        },
        additionalInformation: {
            type: DataTypes.JSON,
            allowNull: true
        }
    };

    const options = {
        timestamps: true,
        paranoid: true,
        underscored: true,
        freezeTableName: true,
        tableName: 'exams'
    };

    const Exam = sequelize.define('Exam', attributes, options);

    Exam.associate = (models) => {
        // Association removed: Certificate table does not have exam_id column
        // If you need to link Exams to Certificates in the future, add exam_id column to certificates table first
    };

    return Exam;
};
