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
        sectionId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false
        },
        number: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        question: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        systemPrompt: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        hint: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    };

    const options = {
        timestamps: true,
        paranoid: true,
        underscored: true,
        tableName: 'interview_section_questions'
    };

    const InterviewSectionQuestion = sequelize.define('InterviewSectionQuestion', attributes, options);

    InterviewSectionQuestion.associate = (models) => {
        InterviewSectionQuestion.belongsTo(models.InterviewSection, {
            targetKey: 'id',
            foreignKey: 'section_id'
        });
    };

    return InterviewSectionQuestion;
};
