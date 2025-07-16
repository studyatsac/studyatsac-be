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
        title: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        }
    };

    const options = {
        timestamps: true,
        paranoid: true,
        underscored: true,
        tableName: 'interviews'
    };

    const Interview = sequelize.define('Interview', attributes, options);

    Interview.associate = (models) => {
        Interview.hasMany(models.InterviewSection, {
            sourceKey: 'id',
            foreignKey: 'interview_id',
            onDelete: 'CASCADE',
            as: 'interviewSections'
        });
    };

    return Interview;
};
