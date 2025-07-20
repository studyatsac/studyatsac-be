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
        tableName: 'essays'
    };

    const Essay = sequelize.define('Essay', attributes, options);

    Essay.associate = (models) => {
        Essay.hasMany(models.EssayItem, {
            sourceKey: 'id',
            foreignKey: 'essay_id',
            onDelete: 'CASCADE',
            as: 'essayItems'
        });
        Essay.hasMany(models.ProductPackageMapping, {
            sourceKey: 'id',
            foreignKey: 'essay_id',
            as: 'productPackageMappings'
        });
    };

    return Essay;
};
