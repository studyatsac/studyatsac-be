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
        essayPackageId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false
        },
        essayId: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false
        },
        maxAttempt: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false,
            defaultValue: 0
        }
    };

    const options = {
        timestamps: true,
        paranoid: true,
        underscored: true,
        tableName: 'essay_package_mappings'
    };

    const EssayPackageMapping = sequelize.define('EssayPackageMapping', attributes, options);

    EssayPackageMapping.associate = (models) => {
        EssayPackageMapping.belongsTo(models.EssayPackage, {
            targetKey: 'id',
            foreignKey: 'essay_package_id'
        });
        EssayPackageMapping.belongsTo(models.Essay, {
            targetKey: 'id',
            foreignKey: 'essay_id',
            as: 'essay'
        });
    };

    return EssayPackageMapping;
};
