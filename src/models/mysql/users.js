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
        fullName: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: false,
            unique: true
        },
        password: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        institutionName: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null
        },
        faculty: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null
        },
        nip: {
            type: DataTypes.STRING(255),
            allowNull: true,
            defaultValue: null
        }
    };

    const options = {
        timestamps: true,
        paranoid: true,
        underscored: true,
        freezeTableName: true,
        tableName: 'users'
    };

    const User = sequelize.define('User', attributes, options);

    User.associate = (models) => {
        User.hasOne(models.IeltsScore, {
            sourceKey: 'id',
            foreignKey: 'user_id'
        });
    };

    return User;
};
