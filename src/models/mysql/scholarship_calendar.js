module.exports = (sequelize, DataTypes) => {
    const attributes = {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        scholarship_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'Foreign key to scholarships table'
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: false,
            comment: 'Event title (e.g., Registration Period, Interview Schedule)'
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Detailed description of the event'
        },
        start_date: {
            type: DataTypes.DATE,
            allowNull: false,
            comment: 'Event start date and time'
        },
        end_date: {
            type: DataTypes.DATE,
            allowNull: false,
            comment: 'Event end date and time'
        },
        registration_deadline: {
            type: DataTypes.DATE,
            allowNull: true,
            comment: 'Registration deadline (optional)'
        },
        announcement_date: {
            type: DataTypes.DATE,
            allowNull: true,
            comment: 'Announcement date (optional)'
        },
        event_type: {
            type: DataTypes.ENUM('registration', 'deadline', 'announcement', 'interview', 'exam', 'other'),
            allowNull: false,
            defaultValue: 'other',
            comment: 'Type of event'
        },
        location: {
            type: DataTypes.STRING(255),
            allowNull: true,
            comment: 'Event location (if offline)'
        },
        is_online: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            comment: 'Whether event is online or offline'
        },
        url: {
            type: DataTypes.STRING(500),
            allowNull: true,
            comment: 'Related URL (registration form, meeting link, etc.)'
        },
        status: {
            type: DataTypes.ENUM('upcoming', 'ongoing', 'completed', 'cancelled'),
            allowNull: false,
            defaultValue: 'upcoming',
            comment: 'Event status'
        }
    };

    const options = {
        timestamps: true,
        paranoid: false,
        underscored: true,
        freezeTableName: true,
        tableName: 'scholarship_calendar',
        indexes: [
            { fields: ['scholarship_id'] },
            { fields: ['event_type'] },
            { fields: ['status'] },
            { fields: ['start_date'] },
            { fields: ['end_date'] }
        ]
    };

    const ScholarshipCalendar = sequelize.define('ScholarshipCalendar', attributes, options);

    ScholarshipCalendar.associate = function (models) {
        ScholarshipCalendar.belongsTo(models.Scholarships, {
            foreignKey: 'scholarship_id',
            targetKey: 'id',
            as: 'scholarship'
        });
    };

    return ScholarshipCalendar;
};
