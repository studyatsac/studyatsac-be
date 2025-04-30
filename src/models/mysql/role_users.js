module.exports = (sequelize, DataTypes) => {
    const RoleUser = sequelize.define('RoleUser', {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        uuid: {
            type: DataTypes.STRING(36),
            allowNull: false,
            unique: true,
            defaultValue: DataTypes.UUIDV4
        },
        user_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false
        },
        role_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    }, {
        timestamps: true,
        underscored: true,
        freezeTableName: true,
        tableName: 'role_users'
    });
    RoleUser.associate = (models) => {
        RoleUser.belongsTo(models.User, { foreignKey: 'user_id' });
        RoleUser.belongsTo(models.Role, { foreignKey: 'role_id' });
    };
    return RoleUser;
};
