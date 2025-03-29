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
        eventType: {
            type: DataTypes.STRING(10),
            allowNull: false
        },
        eventTitle: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        url: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        eventHost: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        eventPlatform: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        startDate: {
            type: DataTypes.DATE(),
            allowNull: false
        },
        endDate: {
            type: DataTypes.DATE(),
            allowNull: false
        }
    };

    const options = {
        timestamps: true,
        paranoid: true,
        underscored: true,
        freezeTableName: true,
        tableName: 'event_updates'
    };

    const EventUpdate = sequelize.define('EventUpdate', attributes, options);

    return EventUpdate;
};
