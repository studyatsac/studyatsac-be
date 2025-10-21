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
        eventName: {
            type: DataTypes.STRING(),
            allowNull: false
        },
        eventDate: {
            type: DataTypes.DATE(),
            allowNull: false
        },
        eventLink: {
            type: DataTypes.STRING(),
            allowNull: true
        },
        eventColor: {
            type: DataTypes.STRING(20),
            allowNull: true
        },
        eventOrder: {
            type: DataTypes.INTEGER(),
            allowNull: false
        },
        description: {
            type: DataTypes.STRING(),
            allowNull: true
        }
    };

    const options = {
        timestamps: true,
        paranoid: true,
        underscored: true,
        freezeTableName: true,
        tableName: 'selection_timelines'
    };

    const SelectionTimeline = sequelize.define('SelectionTimeline', attributes, options);

    return SelectionTimeline;
};
