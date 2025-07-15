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
        interviewId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false
        },
        number: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        systemPrompt: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        duration: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: true
        }
    };

    const options = {
        timestamps: true,
        paranoid: true,
        underscored: true,
        tableName: 'interview_sections'
    };

    const InterviewSection = sequelize.define('InterviewSection', attributes, options);

    InterviewSection.associate = (models) => {
        InterviewSection.belongsTo(models.Interview, {
            targetKey: 'id',
            foreignKey: 'interview_id'
        });

        InterviewSection.hasMany(models.InterviewSectionQuestion, {
            sourceKey: 'id',
            foreignKey: 'section_id',
            onDelete: 'CASCADE',
            as: 'questions'
        });
    };

    return InterviewSection;
};
