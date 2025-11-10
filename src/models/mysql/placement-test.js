module.exports = (sequelize, DataTypes) => {
    const attributes = {
        id: {
            type: DataTypes.INTEGER.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        uuid: {
            type: DataTypes.STRING(36),
            allowNull: false
        },
        user_id: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false
        },
        test_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        score: {
            type: DataTypes.FLOAT,
            allowNull: false
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'created_at'
        },
        updated_at: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'updated_at'
        },
        deleted_at: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'deleted_at'
        }
    };

    const options = {
        timestamps: false, // karena sudah manual pakai created_at dll
        freezeTableName: true,
        tableName: 'placement_test',
        paranoid: false
    };

    const PlacementTest = sequelize.define('PlacementTest', attributes, options);

    PlacementTest.associate = (models) => {
        // PlacementTest milik User
        PlacementTest.belongsTo(models.User, {
            foreignKey: 'user_id'
        });
    };

    return PlacementTest;
};
